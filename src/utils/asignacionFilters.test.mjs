import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesAsignacionFilters } from './asignacionFilters.js';

test('filtra asignaciones con accesorios por serial', () => {
  const asignacion = {
    nombre: 'Juan Pérez',
    usuario: 'jperez',
    tipoEquipo: 'Laptop',
    modelo: 'ThinkPad',
    sn: 'ABC123',
    serialCelular: 'CEL001',
    accesorios: [{ serial: 'ACC-1001' }],
  };

  assert.equal(
    matchesAsignacionFilters(asignacion, {
      searchSerial: '',
      searchNombre: '',
      searchUsuario: '',
      searchCelular: '',
      searchEquipo: '',
      searchModelo: '',
      showOnlyWithAccessories: true,
      searchAccessorySerial: 'acc-1001',
    }),
    true
  );
});

test('excluye asignaciones sin accesorios cuando el filtro está activado', () => {
  const asignacion = {
    nombre: 'Ana Gómez',
    usuario: 'agomez',
    tipoEquipo: 'Laptop',
    modelo: 'ThinkPad',
    sn: 'ABC456',
    serialCelular: '',
    accesorios: [],
  };

  assert.equal(
    matchesAsignacionFilters(asignacion, {
      searchSerial: '',
      searchNombre: '',
      searchUsuario: '',
      searchCelular: '',
      searchEquipo: '',
      searchModelo: '',
      showOnlyWithAccessories: true,
      searchAccessorySerial: '',
    }),
    false
  );
});

test('la búsqueda global encuentra seriales de accesorios', () => {
  assert.equal(matchesAsignacionFilters({ accesorios: [{ serial: 'ZVV1WHW5' }] }, { searchSerial: 'vv1whw' }), true);
});
