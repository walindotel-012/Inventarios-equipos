import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../Icon';

export default function Header({ onToggleSidebar }) {
  const { currentUser } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 px-4 py-3 sm:px-6 xl:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label="Mostrar u ocultar navegación"
          >
            <Icon name="MenuOutline" size="md" color="#475569" />
          </button>
          <div className="flex flex-col">
            <p className="text-xs font-bold uppercase tracking-widest text-[#714B67]">Centro de operaciones</p>
            <p className="text-base font-semibold text-slate-900 sm:text-lg">Inventario y asignaciones</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#F5EFF3] font-bold text-[#714B67]">{currentUser?.displayName?.charAt(0) || 'U'}</div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{currentUser?.displayName || 'Usuario'}</p>
              <p className="text-xs text-slate-500">Administrador</p>
            </div>
            <button onClick={() => setProfileOpen((prev) => !prev)} className="text-slate-500 hover:text-slate-900 transition">
              <Icon name={profileOpen ? 'ChevronUpOutline' : 'ChevronDownOutline'} size="sm" color="neutral" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
