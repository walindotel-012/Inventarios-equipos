import Icon from '../Icon';

export default function AlertsPanel({ alerts = [] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Alertas importantes</h2>
          <p className="text-sm text-slate-500">Eventos que requieren atención inmediata</p>
        </div>
      </div>
      <div className="space-y-4">
        {alerts.map((alert, idx) => (
          <div key={idx} className="flex items-start justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                <Icon name={alert.icon} size="lg" color="#334155" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{alert.title}</p>
                <p className="text-sm text-slate-500">{alert.detail}</p>
              </div>
            </div>
            <div className={`rounded-full px-3 py-1.5 text-sm font-semibold ${alert.color}`}>{alert.badge}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
