import { Link } from 'react-router-dom';

export default function Configuracion() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Configuración</h1>
          <p className="mt-2 text-slate-500">Ajustes del sistema y opciones de personalización.</p>
          <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
            <Link to="/" className="text-blue-600 hover:underline">Volver al Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
