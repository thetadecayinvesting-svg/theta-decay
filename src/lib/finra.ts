// Server-only loader for FINRA's monthly Margin Statistics spreadsheet
// (https://www.finra.org/rules-guidance/key-topics/margin-accounts/margin-statistics).
// FINRA publishes each month's figures around the third week of the following
// month; we re-check the file once a day so new months appear automatically.

import { inflateRawSync } from "node:zlib";
import type { Point } from "./fred";

const MARGIN_XLSX_URL =
  "https://www.finra.org/sites/default/files/2021-03/margin-statistics.xlsx";
const REVALIDATE_SECONDS = 86_400; // once a day

// An .xlsx file is a zip archive of XML files. Pull one file out by name
// using the zip's central directory (no third-party library needed).
function readZipEntry(zip: Buffer, name: string): string | null {
  const eocd = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd < 0) throw new Error("FINRA file is not a valid spreadsheet");
  const count = zip.readUInt16LE(eocd + 10);
  let offset = zip.readUInt32LE(eocd + 16);

  for (let i = 0; i < count; i++) {
    const method = zip.readUInt16LE(offset + 10);
    const compressedSize = zip.readUInt32LE(offset + 20);
    const nameLength = zip.readUInt16LE(offset + 28);
    const extraLength = zip.readUInt16LE(offset + 30);
    const commentLength = zip.readUInt16LE(offset + 32);
    const localHeader = zip.readUInt32LE(offset + 42);
    const entryName = zip.toString("utf8", offset + 46, offset + 46 + nameLength);

    if (entryName === name) {
      const localNameLength = zip.readUInt16LE(localHeader + 26);
      const localExtraLength = zip.readUInt16LE(localHeader + 28);
      const start = localHeader + 30 + localNameLength + localExtraLength;
      const data = zip.subarray(start, start + compressedSize);
      return (method === 8 ? inflateRawSync(data) : data).toString("utf8");
    }
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return null;
}

function decodeXml(text: string) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

// Read the first worksheet into rows of cells keyed by column letter.
function readSheet(zip: Buffer): Record<string, string>[] {
  const sheet = readZipEntry(zip, "xl/worksheets/sheet1.xml");
  if (!sheet) throw new Error("FINRA spreadsheet has no worksheet");

  // Text cells may be stored in a shared table instead of inline.
  const sharedXml = readZipEntry(zip, "xl/sharedStrings.xml");
  const shared = sharedXml
    ? [...sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
        decodeXml([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join("")),
      )
    : [];

  return [...sheet.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map((row) => {
    const cells: Record<string, string> = {};
    for (const cell of row[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const [, column, attrs, body = ""] = cell;
      const type = attrs.match(/t="(\w+)"/)?.[1];
      const value = body.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      const inline = body.match(/<t[^>]*>([\s\S]*?)<\/t>/)?.[1];
      if (type === "s" && value !== undefined) cells[column] = shared[Number(value)] ?? "";
      else if (inline !== undefined) cells[column] = decodeXml(inline);
      else if (value !== undefined) cells[column] = value;
    }
    return cells;
  });
}

// "2026-08" → "2026-08-01". Also handles Excel date serial numbers.
function toMonthStart(cell: string): string | null {
  const match = cell.match(/^(\d{4})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-01`;
  const serial = Number(cell);
  if (Number.isFinite(serial) && serial > 20000) {
    const d = new Date(Date.UTC(1899, 11, 30) + serial * 86_400_000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
  }
  return null;
}

// Margin debt = "Debit Balances in Customers' Securities Margin Accounts",
// converted from $ millions to $ trillions. Oldest first.
export async function getMarginDebt(start = "2000-01-01"): Promise<Point[]> {
  const res = await fetch(MARGIN_XLSX_URL, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`FINRA download failed (${res.status})`);
  const rows = readSheet(Buffer.from(await res.arrayBuffer()));

  // Find the margin-debt column by its header, in case FINRA reorders columns.
  const header = rows[0] ?? {};
  const debitColumn = Object.keys(header).find((col) => /debit balances/i.test(header[col]));
  const dateColumn = Object.keys(header).find((col) => /year-month|date|month/i.test(header[col]));
  if (!debitColumn || !dateColumn) {
    throw new Error("FINRA spreadsheet layout changed: margin debt column not found");
  }

  const points: Point[] = [];
  for (const row of rows.slice(1)) {
    const date = toMonthStart(row[dateColumn] ?? "");
    const millions = Number(row[debitColumn]);
    if (date && date >= start && Number.isFinite(millions) && row[debitColumn] !== "") {
      points.push({ date, value: millions / 1_000_000 });
    }
  }
  if (points.length === 0) throw new Error("FINRA spreadsheet contained no margin data");
  return points.sort((a, b) => a.date.localeCompare(b.date));
}
