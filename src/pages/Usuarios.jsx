import { useEffect, useMemo, useState } from 'react';
import { onSnapshot, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Icon from '../components/Icon';
import Toast from '../components/Toast';
import { useToastManager } from '../hooks/useToastManager';

function generateZPL({ nombre, puesto, sucursal }) {
  // ZPL template optimized for 7cm x 3cm label orientation
  // Line 1: usuario, line 2: departamento
  return `^XA
^FWN
^PW560
^LL240
^CF0,60
^FO0,20^FB560,1,0,C,0^FD${nombre}^FS
^CF0,45
^FO0,100^FB560,1,0,C,0^FD${sucursal}^FS
^XZ`;
}

export default function Usuarios() {
  const { toast, showToast, hideToast } = useToastManager();
  const [asignaciones, setAsignaciones] = useState([]);
  const [filterDept, setFilterDept] = useState('');
  const [filterNombre, setFilterNombre] = useState('');
  const [filterPuesto, setFilterPuesto] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [preview, setPreview] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ nombre: '', puesto: '', sucursal: '' });
  const [showFormatEditor, setShowFormatEditor] = useState(false);
  const [formatConfig, setFormatConfig] = useState({
    label: {
      width: '7cm',
      height: '3cm',
      horizontalAlign: 'center',
      verticalAlign: 'center'
    },
    line1: {
      field: 'usuario',
      fontSize: '5.5mm',
      bold: true,
      color: '#000000',
      fontFamily: 'Zebra 0',
      alignment: 'center'
    },
    line2: {
      field: 'departamento',
      fontSize: '4.5mm',
      bold: true,
      color: '#000000',
      fontFamily: 'Zebra 0',
      alignment: 'center'
    }
  });

  const getUsuario = (registro) => String(registro.nombre || registro.usuario || '').trim();
  const getDepartamento = (registro) => String(registro.sucursal || registro.oficina || registro.departamento || '').trim();
  const getPuesto = (registro) => String(registro.puesto || registro.position || '').trim();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'asignaciones'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const uniqueByUsuario = new Map();
      list.forEach(item => {
        const key = getUsuario(item).toLowerCase();
        if (key && !uniqueByUsuario.has(key)) {
          uniqueByUsuario.set(key, item);
        }
      });
      setAsignaciones(Array.from(uniqueByUsuario.values()));
    }, (err) => {
      console.error('Error listener asignaciones:', err);
      showToast('Error cargando asignaciones', 'error');
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => asignaciones.filter(a => {
    const usuario = getUsuario(a).toLowerCase();
    const departamento = getDepartamento(a).toLowerCase();
    const puesto = getPuesto(a).toLowerCase();
    const matchDept = !filterDept || departamento.includes(filterDept.toLowerCase());
    const matchNombre = !filterNombre || usuario.includes(filterNombre.toLowerCase());
    const matchPuesto = !filterPuesto || puesto.includes(filterPuesto.toLowerCase());
    return matchDept && matchNombre && matchPuesto;
  }), [asignaciones, filterDept, filterNombre, filterPuesto]);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelected(new Set(filtered.map(f => f.id)));
  };

  const clearSelection = () => setSelected(new Set());

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const nombre = String(newUser.nombre || '').trim();
    const puesto = String(newUser.puesto || '').trim();
    const sucursal = String(newUser.sucursal || '').trim();

    if (!nombre) {
      showToast('Ingresa el nombre del usuario', 'warning');
      return;
    }

    const usuarioExistente = asignaciones.some((a) => getUsuario(a).toLowerCase() === nombre.toLowerCase());
    if (usuarioExistente) {
      showToast('Ya existe un usuario con ese nombre', 'warning');
      return;
    }

    try {
      await addDoc(collection(db, 'asignaciones'), {
        nombre,
        usuario: nombre,
        puesto,
        sucursal,
        fechaRegistro: new Date(),
      });
      showToast('Usuario creado correctamente', 'success');
      setNewUser({ nombre: '', puesto: '', sucursal: '' });
      setShowCreateUser(false);
    } catch (error) {
      console.error('Error creando usuario:', error);
      showToast('Error al crear usuario', 'error');
    }
  };

  const handlePreview = (a) => {
    setPreview(a);
  };

  const handlePrintZebra = async (items) => {
    if (!items || items.length === 0) {
      showToast('Selecciona al menos un usuario', 'warning');
      return;
    }
    // Preferred flow: open browser print dialog with an HTML layout sized to 7cm x 3cm.
    // Note: Browsers cannot programmatically choose a specific printer or change driver-level options
    // (media type continuous, rotation, feed settings). The user must select the Zebra ZD230 and
    // set those driver options in the print dialog. For full automation you can use QZ Tray
    // (native connector) to send raw ZPL directly to the printer — see comments below.
    printHtmlLabels(items);
  };

  function printHtmlLabels(items) {
    const labelsHtml = items.map(i => {
      const usuario = escapeHtml(getUsuario(i));
      const departamento = escapeHtml(getDepartamento(i));
      return `
        <div class="page">
          <div class="label">
            <div class="text-block">
              <div class="name">${usuario}</div>
              <div class="department">${departamento}</div>
            </div>
          </div>
        </div>
      `;
    }).join('\n');

    const horizontalAlignValue = formatConfig.label.horizontalAlign === 'left' ? 'flex-start' : formatConfig.label.horizontalAlign === 'right' ? 'flex-end' : 'center';
    const verticalAlignValue = formatConfig.label.verticalAlign === 'top' ? 'flex-start' : formatConfig.label.verticalAlign === 'bottom' ? 'flex-end' : 'center';

    const html = `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Impresión Etiquetas</title>
        <style>
          @page { size: ${formatConfig.label.width} ${formatConfig.label.height}; margin: 0; }
          html, body { margin: 0; padding: 0; }
          body { -webkit-print-color-adjust: exact; }

          .page { width: ${formatConfig.label.width}; height: ${formatConfig.label.height}; page-break-after: always; break-after: page; }
          .label { width: ${formatConfig.label.width}; height: ${formatConfig.label.height}; display: flex; align-items: ${verticalAlignValue}; justify-content: ${horizontalAlignValue}; }
          .text-block { max-width: calc(${formatConfig.label.width} - 2mm); max-height: calc(${formatConfig.label.height} - 2mm); display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 0.5mm; box-sizing: border-box; }
          .name { font-family: '${formatConfig.line1.fontFamily}', Arial, sans-serif; font-size: ${formatConfig.line1.fontSize}; font-weight: ${formatConfig.line1.bold ? 800 : 400}; color: ${formatConfig.line1.color}; text-align: ${formatConfig.line1.alignment}; margin: 0 0 1mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
          .department { font-family: '${formatConfig.line2.fontFamily}', Arial, sans-serif; font-size: ${formatConfig.line2.fontSize}; font-weight: ${formatConfig.line2.bold ? 800 : 400}; color: ${formatConfig.line2.color}; text-align: ${formatConfig.line2.alignment}; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
        </style>
      </head>
      <body>
        ${labelsHtml}
        <script>
          function fitText(el, maxWidth, minFontPx) {
            const style = window.getComputedStyle(el);
            let fontSize = parseFloat(style.fontSize);
            while (fontSize > minFontPx && el.scrollWidth > maxWidth) {
              fontSize -= 0.2;
              el.style.fontSize = fontSize + 'px';
            }
          }

          function fitAll() {
            document.querySelectorAll('.page').forEach(page => {
              const content = page.querySelector('.text-block');
              if (!content) return;
              const availableWidth = content.clientWidth - 4;
              const nameEl = page.querySelector('.name');
              const departmentEl = page.querySelector('.department');
              if (nameEl) fitText(nameEl, availableWidth, 9);
              if (departmentEl) fitText(departmentEl, availableWidth, 8);
            });
          }

          window.addEventListener('load', function() {
            try {
              fitAll();
              window.print();
            } catch (e) {
              console.error('print error', e);
            }
          });
        </script>
      </body>
      </html>`;

    const w = window.open('', '_blank');
    if (!w) {
      showToast('El navegador bloqueó la apertura de la ventana de impresión. Permite ventanas emergentes.', 'error');
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  // Utility to avoid injecting raw HTML
  function escapeHtml(str) {
    return String(str).replace(/[&<>\"']/g, function (s) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":"&#39;"})[s];
    });
  }

  /*
    QZ Tray (optional advanced integration):
    - Install QZ Tray on the client machine and configure the native connector.
    - Use qz-tray JS library to list printers and send raw ZPL to the selected Zebra ZD230.
    - This allows selecting the printer programmatically and sending raw ZPL (so driver
      settings like continuous labels, rotation and feed can be controlled at driver level).

    Example (conceptual):
      qz.api.setCertificate(...)
      qz.websocket.connect().then(() => qz.printers.find('Zebra ZD230')).then(printer => {
        const config = qz.configs.create(printer);
        return qz.print(config, [{ type: 'raw', format: 'command', data: zplString }]);
      });

    Note: QZ Tray requires user installation and explicit permission.
  */

  // Print a test label (uses example data) so the user can quickly validate printer setup
  const printTestLabel = () => {
    const test = [{ nombre: 'Daniel Olivero', puesto: 'Jefe de Taller', sucursal: 'Posventa' }];
    printHtmlLabels(test);
  };

  // Download ZPL for a test label (useful to send directly to Zebra via tools)
  const downloadTestZPL = () => {
    const test = { nombre: 'Daniel Olivero', puesto: 'Jefe de Taller', sucursal: 'Posventa' };
    const zpl = generateZPL({ nombre: test.nombre, puesto: test.puesto, sucursal: test.sucursal });
    const blob = new Blob([zpl], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'etiqueta_prueba.zpl';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Usuarios - Impresión de Etiquetas</h2>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowCreateUser(prev => !prev)} className="btn-primary">Crear usuario</button>
          <button onClick={() => setShowFormatEditor(prev => !prev)} className="btn-secondary">Crear formato de impresión</button>
          <button onClick={selectAllFiltered} className="btn-outline">Seleccionar todos filtrados</button>
          <button onClick={clearSelection} className="btn-secondary">Limpiar selección</button>
          <button onClick={printTestLabel} className="btn-outline">Imprimir prueba</button>
          <button onClick={downloadTestZPL} className="btn-outline">Descargar ZPL</button>
          <button onClick={() => handlePrintZebra(asignaciones.filter(a => selected.has(a.id)))} className="btn-primary flex items-center gap-2"><Icon name="PrinterOutline" size="sm" /> Imprimir seleccionados</button>
          <button onClick={() => handlePrintZebra(filtered)} className="btn-outline flex items-center gap-2"><Icon name="PrinterOutline" size="sm" /> Imprimir todos filtrados</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input placeholder="Filtrar por Departamento" value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="px-3 py-2 border rounded-lg" />
        <input placeholder="Filtrar por Usuario" value={filterNombre} onChange={(e) => setFilterNombre(e.target.value)} className="px-3 py-2 border rounded-lg" />
        <input placeholder="Filtrar por Posición" value={filterPuesto} onChange={(e) => setFilterPuesto(e.target.value)} className="px-3 py-2 border rounded-lg" />
      </div>

      {showCreateUser && (
        <div className="mb-6 border rounded-lg p-4 bg-white shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Crear nuevo usuario</h3>
              <p className="text-sm text-gray-600">Agrega un usuario en el módulo Usuarios usando la misma lógica de este módulo.</p>
            </div>
            <button onClick={() => setShowCreateUser(false)} className="btn-outline">Cerrar</button>
          </div>

          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-sm font-medium">Nombre</span>
              <input type="text" value={newUser.nombre} onChange={(e) => setNewUser(prev => ({ ...prev, nombre: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Puesto</span>
              <input type="text" value={newUser.puesto} onChange={(e) => setNewUser(prev => ({ ...prev, puesto: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Departamento / Sucursal</span>
              <input type="text" value={newUser.sucursal} onChange={(e) => setNewUser(prev => ({ ...prev, sucursal: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
            </label>

            <div className="md:col-span-3 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowCreateUser(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">Guardar usuario</button>
            </div>
          </form>
        </div>
      )}

      {showFormatEditor && (
        <div className="mb-6 border rounded-lg p-4 bg-white shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Editor de formato de impresión</h3>
              <p className="text-sm text-gray-600">Modifica los estilos y la alineación de las dos líneas de la etiqueta.</p>
            </div>
            <button onClick={() => setShowFormatEditor(false)} className="btn-outline">Cerrar</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-3">Línea 1: Usuario</h4>
              <div className="space-y-3">
                <label className="block text-sm font-medium">Tamaño fuente (mm)</label>
                <input type="text" value={formatConfig.line1.fontSize} onChange={(e) => setFormatConfig(prev => ({ ...prev, line1: { ...prev.line1, fontSize: e.target.value } }))} className="w-full px-3 py-2 border rounded-lg" />
                <label className="block text-sm font-medium">Color</label>
                <input type="color" value={formatConfig.line1.color} onChange={(e) => setFormatConfig(prev => ({ ...prev, line1: { ...prev.line1, color: e.target.value } }))} className="w-full h-10 p-0 border rounded-lg" />
                <label className="block text-sm font-medium">Alineación</label>
                <select value={formatConfig.line1.alignment} onChange={(e) => setFormatConfig(prev => ({ ...prev, line1: { ...prev.line1, alignment: e.target.value } }))} className="w-full px-3 py-2 border rounded-lg">
                  <option value="center">Centro</option>
                  <option value="left">Izquierda</option>
                  <option value="right">Derecha</option>
                </select>
                <label className="block text-sm font-medium">Fuente</label>
                <input type="text" value={formatConfig.line1.fontFamily} onChange={(e) => setFormatConfig(prev => ({ ...prev, line1: { ...prev.line1, fontFamily: e.target.value } }))} className="w-full px-3 py-2 border rounded-lg" />
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formatConfig.line1.bold} onChange={(e) => setFormatConfig(prev => ({ ...prev, line1: { ...prev.line1, bold: e.target.checked } }))} className="form-checkbox" />
                  Negrita
                </label>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-3">Línea 2: Departamento</h4>
              <div className="space-y-3">
                <label className="block text-sm font-medium">Tamaño fuente (mm)</label>
                <input type="text" value={formatConfig.line2.fontSize} onChange={(e) => setFormatConfig(prev => ({ ...prev, line2: { ...prev.line2, fontSize: e.target.value } }))} className="w-full px-3 py-2 border rounded-lg" />
                <label className="block text-sm font-medium">Color</label>
                <input type="color" value={formatConfig.line2.color} onChange={(e) => setFormatConfig(prev => ({ ...prev, line2: { ...prev.line2, color: e.target.value } }))} className="w-full h-10 p-0 border rounded-lg" />
                <label className="block text-sm font-medium">Alineación</label>
                <select value={formatConfig.line2.alignment} onChange={(e) => setFormatConfig(prev => ({ ...prev, line2: { ...prev.line2, alignment: e.target.value } }))} className="w-full px-3 py-2 border rounded-lg">
                  <option value="center">Centro</option>
                  <option value="left">Izquierda</option>
                  <option value="right">Derecha</option>
                </select>
                <label className="block text-sm font-medium">Fuente</label>
                <input type="text" value={formatConfig.line2.fontFamily} onChange={(e) => setFormatConfig(prev => ({ ...prev, line2: { ...prev.line2, fontFamily: e.target.value } }))} className="w-full px-3 py-2 border rounded-lg" />
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formatConfig.line2.bold} onChange={(e) => setFormatConfig(prev => ({ ...prev, line2: { ...prev.line2, bold: e.target.checked } }))} className="form-checkbox" />
                  Negrita
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-3">Alineación de etiqueta</h4>
              <label className="block text-sm font-medium">Horizontal</label>
              <select value={formatConfig.label.horizontalAlign} onChange={(e) => setFormatConfig(prev => ({ ...prev, label: { ...prev.label, horizontalAlign: e.target.value } }))} className="w-full px-3 py-2 border rounded-lg">
                <option value="center">Centro</option>
                <option value="left">Izquierda</option>
                <option value="right">Derecha</option>
              </select>
              <label className="block text-sm font-medium mt-3">Vertical</label>
              <select value={formatConfig.label.verticalAlign} onChange={(e) => setFormatConfig(prev => ({ ...prev, label: { ...prev.label, verticalAlign: e.target.value } }))} className="w-full px-3 py-2 border rounded-lg">
                <option value="center">Centro</option>
                <option value="top">Arriba</option>
                <option value="bottom">Abajo</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3"><input type="checkbox" onChange={(e) => e.target.checked ? selectAllFiltered() : clearSelection()} /></th>
              <th className="p-3 text-left">Usuario</th>
              <th className="p-3 text-left">Posición</th>
              <th className="p-3 text-left">Departamento</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="p-3"><input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} /></td>
                <td className="p-3 font-medium">{getUsuario(a)}</td>
                <td className="p-3">{getPuesto(a)}</td>
                <td className="p-3">{getDepartamento(a)}</td>
                <td className="p-3">
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => handlePreview(a)} className="btn-outline text-sm flex items-center gap-2"><Icon name="EyeOutline" size="sm"/> Vista previa</button>
                    <button onClick={() => handlePrintZebra([a])} className="btn-primary text-sm flex items-center gap-2"><Icon name="PrinterOutline" size="sm"/> Imprimir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {preview && (
        <div className="mt-6 card-saas p-4">
          <h3 className="font-semibold mb-2">Vista previa</h3>
          <div className="border p-4 inline-flex items-center justify-center" style={{ background: '#fff' }}>
            <div style={{ width: formatConfig.label.width, height: formatConfig.label.height, border: '1px solid #d1d5db', display: 'flex', alignItems: formatConfig.label.verticalAlign === 'top' ? 'flex-start' : formatConfig.label.verticalAlign === 'bottom' ? 'flex-end' : 'center', justifyContent: formatConfig.label.horizontalAlign === 'left' ? 'flex-start' : formatConfig.label.horizontalAlign === 'right' ? 'flex-end' : 'center', background: '#ffffff' }}>
              <div style={{ maxWidth: `calc(${formatConfig.label.width} - 2mm)`, maxHeight: `calc(${formatConfig.label.height} - 2mm)`, width: 'auto', height: 'auto', padding: '0.5mm', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', boxSizing: 'border-box' }}>
                <div style={{ fontSize: formatConfig.line1.fontSize, fontWeight: formatConfig.line1.bold ? 800 : 400, fontFamily: formatConfig.line1.fontFamily, color: formatConfig.line1.color, textAlign: formatConfig.line1.alignment, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{getUsuario(preview)}</div>
                <div style={{ fontSize: formatConfig.line2.fontSize, fontWeight: formatConfig.line2.bold ? 800 : 400, fontFamily: formatConfig.line2.fontFamily, color: formatConfig.line2.color, textAlign: formatConfig.line2.alignment, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', marginTop: '0.2rem' }}>{getDepartamento(preview)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
