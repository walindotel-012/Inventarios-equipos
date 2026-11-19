import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

export default function OperationsMenu({
  onImportBatch,
  onExportEquipoPrimario,
  onExportEquipoSecundario,
  onExportCelular,
}) {
  const [open, setOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const menuItems = [
    {
      id: 'importaciones',
      label: 'Importaciones',
      icon: 'CloudUploadOutline',
      items: [
        {
          label: 'Importar Asignaciones',
          icon: 'FolderOpenOutline',
          action: onImportBatch,
        },
      ],
    },
    {
      id: 'exportaciones',
      label: 'Exportaciones',
      icon: 'CloudDownloadOutline',
      items: [
        {
          label: 'Export Equipo Principal',
          icon: 'BarChartOutline',
          action: onExportEquipoPrimario,
        },
        {
          label: 'Export Equipo Secundario',
          icon: 'BarChartOutline',
          action: onExportEquipoSecundario,
        },
        {
          label: 'Export Celulares',
          icon: 'BarChartOutline',
          action: onExportCelular,
        },
      ],
    },
  ];

  const handleCategoryClick = (categoryId) => {
    setExpandedCategory((prev) => (prev === categoryId ? '' : categoryId));
  };

  const handleAction = (action) => {
    if (typeof action === 'function') {
      action();
    }
    setOpen(false);
    setExpandedCategory('');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Icon name="AppsOutline" size="sm" color="#2563eb" />
        Operaciones
        <Icon name={open ? 'ChevronUpOutline' : 'ChevronDownOutline'} size="sm" color="#6b7280" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[22rem] min-w-[16rem] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-950">
          <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Operaciones</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Acciones agrupadas por contexto para asignaciones</p>
          </div>
          <div className="max-h-96 space-y-1 overflow-y-auto p-2">
            {menuItems.map((category) => (
              <div key={category.id} className="rounded-3xl bg-slate-50 dark:bg-slate-900/60">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900"
                  onClick={() => handleCategoryClick(category.id)}
                  aria-expanded={expandedCategory === category.id}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon name={category.icon} size="sm" color="#2563eb" />
                    {category.label}
                  </span>
                  <Icon
                    name={expandedCategory === category.id ? 'ChevronUpOutline' : 'ChevronDownOutline'}
                    size="sm"
                    color="#6b7280"
                  />
                </button>

                {expandedCategory === category.id && (
                  <div className="space-y-1 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
                    {category.items.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleAction(item.action)}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <Icon name={item.icon} size="sm" color="#475569" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
