"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PAGES } from "@/lib/pages";

// Hamburger button + slide-out side panel listing every main page.
export default function NavDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const openButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      closeButton.current?.focus();
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      document.addEventListener("keydown", onKey);
      const overflow = document.body.style.overflow;
      document.body.style.overflow = "hidden"; // stop the page scrolling behind it
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = overflow;
      };
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      openButton.current?.focus(); // return focus to the menu button
    }
  }, [open]);

  return (
    <>
      <button
        ref={openButton}
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="site-menu"
        className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-hover hover:text-primary"
      >
        <svg aria-hidden viewBox="0 0 20 20" className="h-5 w-5" fill="none">
          <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {/* Dimmed backdrop: clicking it closes the panel */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col border-r border-border bg-surface shadow-2xl transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <span className="font-display font-semibold tracking-tight">Menu</span>
          <button
            ref={closeButton}
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-hover hover:text-primary"
          >
            <svg aria-hidden viewBox="0 0 20 20" className="h-5 w-5" fill="none">
              <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {PAGES.map((page) => {
              const active = pathname === page.href;
              return (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg border-l-4 px-4 py-3 transition-colors ${
                      active
                        ? "border-l-accent bg-accent-soft"
                        : "border-l-transparent hover:bg-surface-hover"
                    }`}
                  >
                    <div className={`font-medium ${active ? "text-accent-hover" : "text-primary"}`}>
                      {page.label}
                    </div>
                    <div className="mt-0.5 text-xs text-muted">{page.description}</div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <p className="border-t border-border px-5 py-4 text-xs text-muted">
          For information only — not investment advice.
        </p>
      </div>
    </>
  );
}
