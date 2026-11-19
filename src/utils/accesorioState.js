export const getAccesorioIdsFromAsignacion = (asignacion = {}) => {
  const ids = [];

  if (Array.isArray(asignacion.accesorios)) {
    for (const accesorio of asignacion.accesorios) {
      ids.push(accesorio?.id, accesorio?.codigoActivoFijo, accesorio?.serial, accesorio?.numeroSerie, accesorio?.numero, accesorio?.imei);
    }
  }

  if (asignacion.accesorioId) ids.push(asignacion.accesorioId);
  if (asignacion.idAccesorio) ids.push(asignacion.idAccesorio);
  if (asignacion.codigoActivoFijoAccesorio) ids.push(asignacion.codigoActivoFijoAccesorio);

  return Array.from(new Set(ids.filter(Boolean).map(value => String(value).trim()).filter(Boolean)));
};

export const getAccesoriosFromAsignacion = (asignacion = {}) => {
  const accesorios = Array.isArray(asignacion.accesorios)
    ? asignacion.accesorios.filter(Boolean).map(accesorio => ({ ...accesorio }))
    : [];

  if (accesorios.length === 0 && (asignacion.accesorioId || asignacion.idAccesorio || asignacion.codigoActivoFijoAccesorio || asignacion.serialAccesorio)) {
    accesorios.push({
      id: asignacion.accesorioId || asignacion.idAccesorio || '',
      codigoActivoFijo: asignacion.codigoActivoFijoAccesorio || '',
      serial: asignacion.serialAccesorio || '',
      tipoAccesorio: asignacion.tipoAccesorio || asignacion.accesorioNombre || 'Accesorio',
      marca: asignacion.marcaAccesorio || '',
      modelo: asignacion.modeloAccesorio || '',
      condicion: asignacion.condicionAccesorio || '',
    });
  }

  return accesorios;
};

export const getAccesorioIdentifiers = (accesorio = {}) => [
  accesorio.id,
  accesorio.codigoActivoFijo,
  accesorio.serial,
  accesorio.numeroSerie,
  accesorio.numero,
  accesorio.imei,
].filter(Boolean).map(value => String(value).trim().toLowerCase()).filter(Boolean);

export const matchesAccesorio = (left = {}, right = {}) => {
  const rightIds = new Set(getAccesorioIdentifiers(right));
  return rightIds.size > 0 && getAccesorioIdentifiers(left).some(identifier => rightIds.has(identifier));
};

export const normalizeAccesorioStatus = (value = '') => {
  return String(value || '').trim().toLowerCase();
};

export const isAccesorioDisponible = (accesorio = {}) => {
  const status = normalizeAccesorioStatus(accesorio.estado);
  const isAssignedByFlag = accesorio.asignado === true;
  const isAssignedByState = ['asignado', 'ocupado', 'en uso', 'used'].includes(status);

  if (isAssignedByFlag || isAssignedByState) {
    return false;
  }

  return status === 'disponible' || status === 'available' || status === '' || status === 'libre' || status === 'free';
};

export const getAccesorioSearchText = (accesorio = {}) => {
  const values = [
    accesorio.codigoActivoFijo,
    accesorio.tipoAccesorio,
    accesorio.marca,
    accesorio.modelo,
    accesorio.serial,
    accesorio.serie,
    accesorio.numero,
    accesorio.numeroSerie,
    accesorio.imei,
    accesorio.codigo,
    accesorio.descripcion,
  ];

  return values
    .filter(Boolean)
    .map(value => String(value).trim())
    .join(' ')
    .toLowerCase();
};
