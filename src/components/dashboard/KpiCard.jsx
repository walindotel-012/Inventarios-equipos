export default function KpiCard({ title, value, subtitle, trend, color, iconBg, icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${iconBg}`}>
          {icon}
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{title}</p>
      </div>
      <div className="mt-6">
        <p className="text-4xl font-bold text-slate-900">{value}</p>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className={`mt-6 inline-flex rounded-full px-3 py-2 text-sm font-semibold ${color}`}>{trend}</div>
    </div>
  );
}
