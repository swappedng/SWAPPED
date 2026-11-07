'use client';

import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6] text-slate-900">
      <AdminSidebar />
      <main className="min-h-screen px-4 pb-16 pt-24 sm:px-7 lg:ml-[264px] lg:px-10 lg:pt-10 xl:px-14">
        <div className="mx-auto w-full max-w-[1360px]">{children}</div>
      </main>
    </div>
  );
}
