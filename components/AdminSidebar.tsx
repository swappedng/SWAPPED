"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { ArrowLeftRight, BadgePercent, CircleHelp, ExternalLink, LayoutDashboard, LogOut, Menu, Package, SlidersHorizontal, Smartphone, Store, Tag, X } from "lucide-react";

const navGroups = [
  { label: "Workspace", items: [
    { href: "/admin", label: "Home", description: "Overview and next steps", icon: LayoutDashboard },
    { href: "/admin/swaps", label: "Customer requests", description: "Review submitted swaps", icon: ArrowLeftRight },
  ]},
  { label: "Trade-in setup", items: [
    { href: "/admin/phone-models", label: "Trade-in values", description: "Set the starting value", icon: Smartphone },
    { href: "/admin/condition-attributes", label: "Condition questions", description: "Set condition deductions", icon: SlidersHorizontal },
    { href: "/admin/selling-prices", label: "Phones for sale", description: "Set customer prices", icon: Tag },
  ]},
  { label: "More", items: [
    { href: "/admin/pricing-rules", label: "Price adjustments", description: "Advanced quote rules", icon: BadgePercent },
    { href: "/admin/promotions", label: "Promotions", description: "Limited-time bonuses", icon: Store },
    { href: "/admin/inventory", label: "Inventory", description: "Manage available devices", icon: Package },
  ]},
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);
  const isActive = (href: string) => href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const sidebar = (
    <aside className="flex h-full w-64 flex-col bg-[#f7f7f5] text-sm">
      <div className="flex h-14 items-center justify-between px-4 mt-2">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 shadow-sm"><img src="/swapped-logo.png" alt="" className="h-4 w-4 object-contain" /></div>
          <div><p className="text-sm font-semibold tracking-tight text-slate-900">Swapped Workspace</p></div>
        </Link>
        <button onClick={() => setMobileOpen(false)} className="rounded p-1 text-slate-500 hover:bg-black/5 lg:hidden" aria-label="Close menu"><X className="h-4 w-4" /></button>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-2 py-4">
        {navGroups.map((group) => <div key={group.label}>
          <p className="mb-1 px-3 text-[11px] font-medium text-slate-500">{group.label}</p>
          <div className="space-y-0.5">{group.items.map((item) => {
            const Icon = item.icon; const active = isActive(item.href);
            return <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 rounded-md px-3 py-1.5 transition-colors ${active ? "bg-black/5 text-slate-900 font-medium" : "text-slate-600 hover:bg-black/5 hover:text-slate-900"}`}>
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-slate-900" : "text-slate-400"}`} />
              <div className="min-w-0"><p className="truncate text-sm">{item.label}</p></div>
            </Link>;
          })}</div>
        </div>)}
      </nav>
      <div className="space-y-0.5 p-2 mb-2">
        <button onClick={() => setShowHelp(true)} className="flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-black/5 hover:text-slate-900"><CircleHelp className="h-4 w-4 shrink-0 text-slate-400" /> How pricing works</button>
        <Link href="/" target="_blank" className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-black/5 hover:text-slate-900"><ExternalLink className="h-4 w-4 shrink-0 text-slate-400" /> View customer website</Link>
        <button onClick={() => signOut({ redirect: true, callbackUrl: "/" })} className="flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-black/5 hover:text-slate-900"><LogOut className="h-4 w-4 shrink-0 text-slate-400" /> Sign out</button>
      </div>
    </aside>
  );

  return <>
    <div className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
      <Link href="/admin" className="flex items-center gap-2.5 font-bold text-slate-950"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950"><img src="/swapped-logo.png" alt="" className="h-5 w-5" /></div>Swapped Admin</Link>
      <button onClick={() => setMobileOpen(true)} className="rounded-lg border border-slate-200 p-2 text-slate-700" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
    </div>
    <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-slate-950/40" onClick={() => setMobileOpen(false)} aria-label="Close menu" /><div className="relative h-full w-72 shadow-2xl">{sidebar}</div></div>}
    {showHelp && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={() => setShowHelp(false)}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-violet-600">Quick guide</p><h2 className="mt-1 text-xl font-bold text-slate-950">How a quote is calculated</h2></div><button onClick={() => setShowHelp(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
        <div className="mt-6 space-y-3">{[
          ["1", "Start with a trade-in value", "Set the highest amount you would pay for each phone."],
          ["2", "Apply condition deductions", "The customer's answers reduce that starting value."],
          ["3", "Compare with the selling price", "The customer sees what remains to pay for their chosen phone."],
        ].map(([number, title, description]) => <div key={number} className="flex gap-3 rounded-xl bg-slate-50 p-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">{number}</span><div><p className="text-sm font-bold text-slate-900">{title}</p><p className="mt-1 text-sm leading-5 text-slate-600">{description}</p></div></div>)}</div>
        <button onClick={() => setShowHelp(false)} className="mt-6 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">Got it</button>
      </div>
    </div>}
  </>;
}
