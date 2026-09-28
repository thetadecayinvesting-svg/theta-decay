"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Calendar" },
  { href: "/dashboard", label: "Economic Indicators" },
  { href: "/markets", label: "Markets" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:py-0 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm font-semibold text-on-accent">
            Θ
          </span>
          <span className="whitespace-nowrap font-display font-semibold tracking-tight">Theta Decay Investing</span>
        </Link>
        <nav className="-mx-1 flex gap-1 overflow-x-auto text-sm">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-lg px-3 py-2 transition-colors ${
                  active
                    ? "bg-accent-soft font-medium text-accent-hover"
                    : "text-muted hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
