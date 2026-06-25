export default function RecentActivityTable({ activities }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Actividad reciente</h2>
          <p className="text-sm text-slate-500">Las últimas acciones registradas en el sistema</p>
        </div>
        <button className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Ver todas</button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-600">
          <thead>
            <tr>
              <th className="pb-3 font-semibold text-slate-900">Fecha</th>
              <th className="pb-3 font-semibold text-slate-900">Usuario</th>
              <th className="pb-3 font-semibold text-slate-900">Acción</th>
              <th className="pb-3 font-semibold text-slate-900">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((item) => (
              <tr key={item.id} className="border-t border-slate-100 transition hover:bg-slate-50">
                <td className="py-4 pr-6 font-medium text-slate-900">{item.date}</td>
                <td className="py-4 pr-6">{item.user}</td>
                <td className="py-4 pr-6">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.color}`}>{item.action}</span>
                </td>
                <td className="py-4 pr-6 text-slate-500">{item.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
