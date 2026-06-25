export default function DashboardLayout({ sidebar, mobileSidebar, header, children, sidebarOpen }) {
  const layoutClasses = sidebarOpen ? 'xl:grid xl:grid-cols-[240px_1fr] xl:min-h-screen' : 'xl:grid xl:grid-cols-1 xl:min-h-screen';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className={layoutClasses}>
        <aside className={`${sidebarOpen ? 'hidden xl:block' : 'hidden'} border-r border-slate-200 bg-white`}>{sidebar}</aside>

        {mobileSidebar}

        <div className="min-h-screen">
          <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 backdrop-blur-sm">
            {header}
          </div>
          <main className="p-6 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
