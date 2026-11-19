import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

export default function SearchView({
  value = '',
  onChange,
  placeholder = 'Buscar...',
  chips = [],
  onRemoveChip,
  onClear,
  resultCount,
  children,
  open: controlledOpen,
  onOpenChange,
  compact = false,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (nextValue) => {
    const nextOpen = typeof nextValue === 'function' ? nextValue(open) : nextValue;
    if (controlledOpen === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };
  const rootRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative z-30 mb-6">
      <div className={`flex min-h-12 items-center rounded-xl border bg-white shadow-sm transition ${open ? 'border-[#714B67] ring-4 ring-[#714B67]/10' : 'border-slate-300'}`}>
        <div className="pl-3"><Icon name="SearchOutline" size="sm" color="#475569" /></div>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 px-2 py-1.5">
          {chips.map((chip) => (
            <span key={chip.key} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-[#F5EFF3] px-2.5 text-xs font-semibold text-[#714B67]">
              {chip.label}
              <button type="button" onClick={() => onRemoveChip?.(chip.key)} className="grid h-6 w-6 place-items-center rounded-md hover:bg-white" aria-label={`Quitar filtro ${chip.label}`}><Icon name="CloseOutline" size="xs" color="#714B67" /></button>
            </span>
          ))}
          <input value={value} onChange={(event) => onChange?.(event.target.value)} onFocus={() => setOpen(true)} placeholder={chips.length ? 'Añadir búsqueda...' : placeholder} className="min-h-9 min-w-[150px] flex-1 border-0 bg-transparent px-1 text-sm shadow-none focus:ring-0" />
        </div>
        {resultCount !== undefined && <span className="hidden border-l border-slate-200 px-3 text-xs font-semibold text-slate-500 sm:block">{resultCount} resultados</span>}
        {(chips.length > 0 || value) && <button type="button" onClick={onClear} className="grid h-11 w-11 place-items-center text-slate-500 hover:text-[#714B67]" aria-label="Limpiar búsqueda"><Icon name="CloseCircleOutline" size="sm" color="currentColor" /></button>}
        <button type="button" onClick={() => setOpen((current) => !current)} className="grid h-12 w-12 place-items-center border-l border-slate-200 bg-slate-50" aria-expanded={open} aria-label="Mostrar filtros"><Icon name={open ? 'ChevronUpOutline' : 'ChevronDownOutline'} size="sm" color="#475569" /></button>
      </div>
      {open && (
        <div className={`absolute top-[calc(100%+8px)] max-h-[min(520px,70vh)] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_-18px_rgba(15,23,42,0.28)] ${compact ? 'left-0 right-0 lg:left-auto lg:w-[min(780px,calc(100vw-4rem))]' : 'left-0 right-0'}`}>
          <div className={`search-view-menu grid min-w-0 ${compact ? '' : 'md:grid-cols-[minmax(0,2fr)_minmax(190px,0.8fr)_minmax(180px,0.7fr)]'}`}>
            <section className={`min-w-0 ${compact ? 'p-4 sm:p-5' : 'p-5'}`}>
              <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#F5EFF3]"><Icon name="FunnelOutline" size="sm" color="#714B67" /></span><div><h3 className="text-sm font-bold text-slate-900">Filtrar asignaciones</h3>{compact && <p className="mt-0.5 text-xs text-slate-500">Combina uno o varios criterios para precisar los resultados.</p>}</div></div>
                {compact && <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Cerrar filtros"><Icon name="CloseOutline" size="sm" color="currentColor" /></button>}
              </div>
              <div className="search-view-fields">{children}</div>
              {compact && <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3"><span className="text-xs font-medium text-slate-500">{resultCount ?? 0} resultados encontrados</span><div className="flex gap-2">{(chips.length > 0 || value) && <button type="button" onClick={onClear} className="min-h-9 rounded-lg px-3 text-sm font-semibold text-[#714B67] hover:bg-[#F5EFF3]">Limpiar filtros</button>}<button type="button" onClick={() => setOpen(false)} className="min-h-9 rounded-lg bg-[#714B67] px-4 text-sm font-semibold text-white hover:bg-[#5f3d56]">Ver resultados</button></div></div>}
            </section>

            {!compact && <section className="border-t border-slate-200 p-5 md:border-l md:border-t-0">
              <div className="mb-4 flex items-center gap-2"><Icon name="LayersOutline" size="sm" color="#0f8b8d" /><h3 className="text-sm font-bold text-slate-900">Criterios activos</h3></div>
              <div className="space-y-1">
                {value && <div className="flex min-h-9 items-center justify-between gap-2 border-b border-slate-100 py-2 text-sm text-slate-700"><span className="truncate">Búsqueda: {value}</span><button type="button" onClick={() => onChange?.('')} className="grid h-7 w-7 flex-none place-items-center rounded-md hover:bg-slate-100" aria-label="Quitar búsqueda"><Icon name="CloseOutline" size="xs" color="#64748b" /></button></div>}
                {chips.map((chip) => <div key={chip.key} className="flex min-h-9 items-center justify-between gap-2 border-b border-slate-100 py-2 text-sm text-slate-700"><span className="truncate">{chip.label}</span><button type="button" onClick={() => onRemoveChip?.(chip.key)} className="grid h-7 w-7 flex-none place-items-center rounded-md hover:bg-slate-100" aria-label={`Quitar filtro ${chip.label}`}><Icon name="CloseOutline" size="xs" color="#64748b" /></button></div>)}
                {!value && chips.length === 0 && <p className="py-2 text-sm text-slate-400">Sin filtros aplicados</p>}
              </div>
            </section>}

            {!compact && <section className="border-t border-slate-200 p-5 md:border-l md:border-t-0">
              <div className="mb-4 flex items-center gap-2"><Icon name="StarOutline" size="sm" color="#eab308" /><h3 className="text-sm font-bold text-slate-900">Resumen</h3></div>
              <div className="border-b border-slate-100 py-2"><p className="text-2xl font-bold text-slate-900">{resultCount ?? 0}</p><p className="text-xs text-slate-500">registros encontrados</p></div>
              {(chips.length > 0 || value) && <button type="button" onClick={onClear} className="mt-3 flex min-h-10 w-full items-center justify-between rounded-lg px-2 text-left text-sm font-medium text-[#714B67] hover:bg-[#F5EFF3]"><span>Restablecer filtros</span><Icon name="RefreshOutline" size="sm" color="#714B67" /></button>}
            </section>}
          </div>
        </div>
      )}
    </div>
  );
}
