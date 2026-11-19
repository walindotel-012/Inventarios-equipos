import { Link } from 'react-router-dom';

export default function Configuracion() {
  return (
    <div className="min-h-screen bg-[#f8f9fb] p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="border-b border-slate-200 pb-6 pt-2">
          <p className="text-xs font-bold uppercase tracking-widest text-[#714B67]">Sistema</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Configuración</h1>
          <p className="mt-2 text-slate-500">Ajustes del sistema y opciones de personalización.</p>
          <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
            <Link to="/" className="text-blue-600 hover:underline">Volver al Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
