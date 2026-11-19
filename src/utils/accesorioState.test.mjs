import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAccesorioIdentifiers,
  getAccesoriosFromAsignacion,
  matchesAccesorio,
} from './accesorioState.js';

test('extrae accesorios actuales y heredados de una asignación', () => {
  assert.equal(getAccesoriosFromAsignacion({ accesorios: [{ serial: 'ZVV1WHW5' }] })[0].serial, 'ZVV1WHW5');
  assert.equal(getAccesoriosFromAsignacion({ serialAccesorio: 'ZVV1WHWP' })[0].serial, 'ZVV1WHWP');
});

test('identifica el mismo accesorio aunque cambie el campo identificador', () => {
  assert.equal(matchesAccesorio(
    { id: 'ATM-ACC-0010', serial: 'ZVV1RRREM' },
    { codigoActivoFijo: 'ATM-ACC-0010' }
  ), true);
  assert.deepEqual(getAccesorioIdentifiers({ serial: ' ZVV1RRREM ' }), ['zvv1rrrem']);
});
