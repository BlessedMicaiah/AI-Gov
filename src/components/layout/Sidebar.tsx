"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authedNav } from "./nav";

/**
 * Left-hand dashboard sidebar shown to authenticated users on desktop.
 * Mobile navigation continues to live in the Header's hamburger menu.
 */
export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex fixed top-16 left-0 bottom-0 z-40 w-60 flex-col border-r border-terminal-border bg-terminal-dark">
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="px-3 mb-3 font-mono text-[10px] tracking-[0.22em] text-terminal-muted uppercase">
          Navigation
        </div>
        {authedNav.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 font-mono text-sm transition-colors ${
                active
                  ? "bg-terminal-green/15 text-terminal-green font-semibold"
                  : "text-terminal-muted hover:bg-terminal-gray hover:text-terminal-text"
              }`}
            >
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-md transition-colors ${
                  active ? "bg-terminal-green/20" : ""
                }`}
              >
                {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
