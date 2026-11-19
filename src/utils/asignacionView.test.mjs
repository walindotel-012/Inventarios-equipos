import test from 'node:test';
import assert from 'node:assert/strict';
import { formatAssignmentDate, getAssignmentAssets } from './asignacionView.js';

test('presenta todos los activos de una asignación como elementos compactos', () => {
  const assets = getAssignmentAssets({
    tipoEquipo: 'Laptop',
    sn: 'LAP-001',
    tipoEquipoSecundario: 'Monitor',
    snSecundario: 'MON-002',
    tipoEquipoCelular: 'Flota',
    serialCelular: 'FLO-003',
    accesorios: [
      { tipoAccesorio: 'Mouse', serial: 'MOU-004' },
      { tipoAccesorio: 'Dock', codigoActivoFijo: 'DOC-005' },
    ],
  });

  assert.deepEqual(
    assets.map(({ label, identifier }) => `${label} (${identifier})`),
    ['Laptop (LAP-001)', 'Monitor (MON-002)', 'Flota (FLO-003)', 'Mouse (MOU-004)', 'Dock (DOC-005)']
  );
});

test('mantiene compatibilidad con accesorios del formato anterior', () => {
  assert.deepEqual(getAssignmentAssets({
    tipoAccesorio: 'Mousepad',
    codigoActivoFijoAccesorio: 'MP-100',
  }), [{ key: 'mousepad-mp-100', label: 'Mousepad', identifier: 'MP-100' }]);
});

test('formatea fechas ISO sin cambiar el día por zona horaria', () => {
  assert.equal(formatAssignmentDate('2026-09-01'), '01/09/2026');
  assert.equal(formatAssignmentDate(''), 'Sin fecha');
});
