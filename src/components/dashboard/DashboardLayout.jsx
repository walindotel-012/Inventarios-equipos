export default function DashboardLayout({ sidebar, mobileSidebar, header, children, sidebarOpen }) {
  const layoutClasses = sidebarOpen ? 'xl:grid xl:grid-cols-[268px_minmax(0,1fr)] xl:min-h-screen' : 'xl:grid xl:grid-cols-1 xl:min-h-screen';

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-slate-900">
      <div className={layoutClasses}>
        <aside className={`${sidebarOpen ? 'hidden xl:block' : 'hidden'} bg-[#1B2438]`}>{sidebar}</aside>

        {mobileSidebar}

        <div className="min-h-screen">
          <div className="sticky top-0 z-20 border-b border-slate-200 bg-[#f8f9fb]/95 backdrop-blur-sm">
            {header}
          </div>
          <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
