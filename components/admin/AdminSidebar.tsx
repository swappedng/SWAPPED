"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { ArrowLeftRight, Calendar, CalendarDays, CircleHelp, ExternalLink, LayoutDashboard, LogOut, Menu, Smartphone, Tag, X } from "lucide-react";

const groups = [
  { label: "OPERATIONS", items: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/swaps", label: "Customer requests", icon: ArrowLeftRight },
    { href: "/admin/appointments", label: "Appointments", icon: CalendarDays },
    { href: "/admin/availability", label: "Availability", icon: Calendar },
  ] },
  { label: "CATALOGUE & PRICING", items: [
    { href: "/admin/phone-models", label: "Buying Prices", icon: Smartphone },
    { href: "/admin/selling-prices", label: "Selling Prices", icon: Tag },
  ] },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  useEffect(() => setMobileOpen(false), [pathname]);

  const sidebar = <aside className="flex h-full w-[264px] flex-col border-r border-stone-200 bg-[#f8f8f6] text-sm">
    <div className="flex h-[76px] items-center justify-between border-b border-stone-200 px-5">
      <Link href="/admin" className="flex items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950"><img src="/swapped-logo.png" alt="" className="h-6 w-6 object-contain" /></span>
        <span><span className="block text-[15px] font-semibold tracking-tight text-slate-950">Swapped</span><span className="block text-[11px] font-medium text-slate-500">ADMIN WORKSPACE</span></span>
      </Link>
      <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-stone-200 lg:hidden" aria-label="Close menu"><X className="h-5 w-5" /></button>
    </div>
    <nav aria-label="Admin navigation" className="flex-1 space-y-7 overflow-y-auto px-3 py-7">
      {groups.map((group) => <div key={group.label}>
        <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.14em] text-slate-400">{group.label}</p>
        <div className="space-y-1">{group.items.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/admin" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900 ${active ? "bg-white font-semibold text-slate-950 shadow-[0_1px_3px_rgba(15,23,42,0.08)] ring-1 ring-stone-200" : "font-medium text-slate-600 hover:bg-stone-200/70 hover:text-slate-950"}`}>
            <Icon className={`h-[17px] w-[17px] shrink-0 ${active ? "text-slate-900" : "text-slate-400"}`} />{item.label}
          </Link>;
        })}</div>
      </div>)}
    </nav>
    <div className="space-y-1 border-t border-stone-200 px-3 py-4">
      <button onClick={() => setShowHelp(true)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-slate-600 hover:bg-stone-200/70"><CircleHelp className="h-[17px] w-[17px] text-slate-400" /> How pricing works</button>
      <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-stone-200/70"><ExternalLink className="h-[17px] w-[17px] text-slate-400" /> View website</Link>
      <button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-slate-600 hover:bg-stone-200/70"><LogOut className="h-[17px] w-[17px] text-slate-400" /> Sign out</button>
    </div>
  </aside>;

  return <>
    <div className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-[#f8f8f6] px-4 lg:hidden"><span className="text-sm font-semibold text-slate-950">Swapped <span className="font-normal text-slate-500">/ Admin</span></span><button onClick={() => setMobileOpen(true)} className="rounded-lg border border-stone-200 bg-white p-2 text-slate-700" aria-label="Open menu"><Menu className="h-5 w-5" /></button></div>
    <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-slate-950/45" onClick={() => setMobileOpen(false)} aria-label="Close menu" /><div className="relative h-full w-[264px] shadow-2xl">{sidebar}</div></div>}
    {showHelp && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={() => setShowHelp(false)}><div role="dialog" aria-modal="true" aria-labelledby="pricing-help-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quote guide</p><h2 id="pricing-help-title" className="mt-1 text-xl font-semibold text-slate-950">How pricing works</h2></div><button onClick={() => setShowHelp(false)} aria-label="Close guide" className="rounded-lg p-2 text-slate-500 hover:bg-stone-100"><X className="h-5 w-5" /></button></div><div className="mt-5 space-y-4 text-sm text-slate-600"><p className="text-slate-900 font-medium">Trade-in value calculation</p><ol className="space-y-3"><li><strong className="text-slate-900">1. Base price:</strong> The buying price you set for each phone model (e.g., iPhone 15 Pro Max 256GB = ₦450,000)</li><li><strong className="text-slate-900">2. Condition deductions:</strong> Each answer subtracts from the base price based on model-specific modifiers you configure.</li><li><strong className="text-slate-900">3. Screen/battery replacement:</strong> If replaced, additional deduction applies.</li></ol><div className="mt-4 rounded-lg bg-stone-50 p-4 border border-stone-200"><p className="text-xs font-semibold text-slate-500 mb-2">EXAMPLE: iPhone 15 Pro Max</p><div className="space-y-1.5 text-xs"><div className="flex justify-between"><span className="text-slate-600">Base buying price</span><span className="font-medium text-slate-900">₦450,000</span></div><div className="flex justify-between"><span className="text-slate-600">Screen: Cracked (-₦80,000)</span><span className="font-medium text-rose-600">-₦80,000</span></div><div className="flex justify-between"><span className="text-slate-600">Battery: 80% (-₦30,000)</span><span className="font-medium text-rose-600">-₦30,000</span></div><div className="flex justify-between"><span className="text-slate-600">Screen replaced: Yes (-₦50,000)</span><span className="font-medium text-rose-600">-₦50,000</span></div><div className="my-2 border-t border-stone-200"></div><div className="flex justify-between"><span className="font-semibold text-slate-900">Final trade-in value</span><span className="font-bold text-slate-900">₦290,000</span></div></div></div><p className="text-slate-900 font-medium mt-4">Upgrade calculation</p><p className="text-slate-600">If the customer upgrades to an iPhone 16 Pro Max (₦950,000), they pay: <span className="font-semibold text-slate-900">₦950,000 - ₦290,000 = ₦660,000</span></p></div><button onClick={() => setShowHelp(false)} className="mt-6 w-full rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Close</button></div></div>}
  </>;
}
