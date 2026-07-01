"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { authedNav } from "./nav";

/**
 * Left-hand dashboard sidebar shown to authenticated users on desktop.
 * Collapses to an icon-only rail; the expanded/collapsed state is owned by
 * AppShell so the main content offset stays in sync.
 * Mobile navigation continues to live in the Header's hamburger menu.
 */
export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`hidden md:flex fixed top-16 left-0 bottom-0 z-40 flex-col border-r border-terminal-border bg-terminal-dark transition-[width] duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Header row: section label + collapse toggle */}
      <div
        className={`flex items-center h-11 px-3 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <span className="font-mono text-[10px] tracking-[0.22em] text-terminal-muted uppercase">
            Navigation
          </span>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className="flex items-center justify-center w-8 h-8 rounded-md text-terminal-muted hover:bg-terminal-gray hover:text-terminal-text transition-colors"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {authedNav.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.name : undefined}
              className={`flex items-center gap-3 rounded-md py-2.5 font-mono text-sm transition-colors ${
                collapsed ? "justify-center px-0" : "px-3"
              } ${
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
              {!collapsed && item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
