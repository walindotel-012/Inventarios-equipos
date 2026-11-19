import { Link } from 'react-router-dom';
import Icon from '../Icon';

export default function RecentActivityTable({ activities }) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Actividad reciente</h2>
          <p className="text-sm text-slate-500">Últimos movimientos registrados</p>
        </div>
        <Link to="/bitacora" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          Ver todas <Icon name="ArrowForwardOutline" size="sm" color="#714B67" />
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="mt-6 flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#F5EFF3]">
            <Icon name="DocumentTextOutline" size="md" color="#714B67" />
          </div>
          <p className="mt-4 font-semibold text-slate-900">Aún no hay movimientos</p>
          <p className="mt-1 text-sm text-slate-500">Las asignaciones y descargos aparecerán aquí.</p>
        </div>
      ) : (
        <>
          <div className="mt-5 hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50">
                <tr>{['Fecha', 'Usuario', 'Acción', 'Detalle'].map((label) => <th key={label} className="px-4 py-3 font-semibold text-slate-700">{label}</th>)}</tr>
              </thead>
              <tbody>
                {activities.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 transition hover:bg-slate-50">
                    <td className="px-4 py-4 font-medium text-slate-900">{item.date || 'Sin fecha'}</td>
                    <td className="px-4 py-4">{item.user}</td>
                    <td className="px-4 py-4"><span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${item.color}`}>{item.action}</span></td>
                    <td className="px-4 py-4 text-slate-500">{item.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 grid gap-3 md:hidden">
            {activities.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3"><span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${item.color}`}>{item.action}</span><time className="text-xs text-slate-500">{item.date || 'Sin fecha'}</time></div>
                <p className="mt-3 font-semibold text-slate-900">{item.detail}</p>
                <p className="mt-1 text-sm text-slate-500">{item.user}</p>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
