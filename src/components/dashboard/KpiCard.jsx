export default function KpiCard({ title, value, subtitle, trend, color, iconBg, icon }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${iconBg}`}>
          {icon}
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</p>
      </div>
      <div className="mt-6">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className={`mt-5 inline-flex rounded-lg px-3 py-2 text-xs font-semibold ${color}`}>{trend}</div>
    </div>
  );
}
