import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../Icon';

export default function Header({ onToggleSidebar }) {
  const { currentUser } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 px-6 py-4 xl:px-8 xl:py-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span className="text-lg">☰</span>
          </button>
          <div className="flex flex-col">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">AUTOMÍA</p>
            <h1 className="text-2xl font-semibold text-slate-900">Mueve tu mundo ahora</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <div className="h-10 w-10 rounded-2xl bg-slate-800 text-white grid place-items-center">U</div>
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
