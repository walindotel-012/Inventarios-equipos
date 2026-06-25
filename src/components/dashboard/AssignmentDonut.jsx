import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#2563eb', '#6366f1', '#f59e0b'];

export default function AssignmentDonut({ data }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Asignaciones por estado</h2>
        <p className="text-sm text-slate-500">Distribución de asignaciones activas y pendientes</p>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:items-center md:justify-between">
        <div className="h-56 w-full md:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={64}
                outerRadius={96}
                paddingAngle={4}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex w-full flex-col gap-4 md:w-1/2">
          <div className="rounded-3xl bg-slate-50 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">120 Total</p>
          </div>
          <div className="space-y-3">
            {data.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-3 w-3 rounded-full" style={{ background: COLORS[idx % COLORS.length] }} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{entry.name}</p>
                    <p className="text-sm text-slate-500">{entry.value} ({entry.percent}%)</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-900">{entry.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
