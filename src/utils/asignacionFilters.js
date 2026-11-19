export const matchesAsignacionFilters = (asignacion, filters) => {
  const {
    searchSerial = '',
    searchNombre = '',
    searchUsuario = '',
    searchCelular = '',
    searchEquipo = '',
    searchModelo = '',
    showOnlyWithAccessories = false,
    searchAccessorySerial = '',
  } = filters;

  const normalizedSearchSerial = searchSerial.toLowerCase();
  const normalizedSearchNombre = searchNombre.toLowerCase();
  const normalizedSearchUsuario = searchUsuario.toLowerCase();
  const normalizedSearchAccessorySerial = searchAccessorySerial.toLowerCase();

  const accesorios = Array.isArray(asignacion.accesorios) ? asignacion.accesorios : [];
  const allAssignedSerials = [
    asignacion.sn,
    asignacion.snSecundario,
    asignacion.codActivoFijo,
    asignacion.codActivoFijoSecundario,
    asignacion.netbiosName,
    asignacion.netbiosNameSecundario,
    asignacion.serialCelular,
    asignacion.imeiCelular,
    asignacion.numeroCelular,
    asignacion.serialAccesorio,
    asignacion.codigoActivoFijoAccesorio,
    ...accesorios.flatMap(accesorio => [
      accesorio?.serial,
      accesorio?.numero,
      accesorio?.numeroSerie,
      accesorio?.imei,
      accesorio?.codigoActivoFijo,
    ]),
  ];
  const matchSerial = !normalizedSearchSerial || allAssignedSerials
    .some(value => String(value || '').toLowerCase().includes(normalizedSearchSerial));

  const matchNombre = !normalizedSearchNombre || String(asignacion.nombre || '').toLowerCase().includes(normalizedSearchNombre);
  const matchUsuario = !normalizedSearchUsuario || String(asignacion.usuario || '').toLowerCase().includes(normalizedSearchUsuario);
  const normalizedSearchCelular = searchCelular.toLowerCase();
  const matchCelular = !normalizedSearchCelular || [
    asignacion.serialCelular,
    asignacion.imeiCelular,
    asignacion.numeroCelular,
  ].some(value => String(value || '').toLowerCase().includes(normalizedSearchCelular));
  const matchEquipo = !searchEquipo || [asignacion.tipoEquipo, asignacion.tipoEquipoSecundario, asignacion.tipoEquipoCelular]
    .some(value => String(value || '') === String(searchEquipo));
  const matchModelo = !searchModelo || [asignacion.modelo, asignacion.modeloSecundario, asignacion.modeloCelular]
    .some(value => String(value || '') === String(searchModelo));

  const accessorySerials = accesorios.flatMap(acc => [acc?.serial, acc?.numero, acc?.numeroSerie, acc?.imei, acc?.codigoActivoFijo])
    .concat([asignacion.serialAccesorio, asignacion.codigoActivoFijoAccesorio])
    .map(value => String(value || ''))
    .filter(Boolean);
  const hasAccessories = accessorySerials.length > 0;
  const matchAccessories = !showOnlyWithAccessories || hasAccessories;
  const matchAccessorySerial = !normalizedSearchAccessorySerial || accessorySerials.some(serial => serial.toLowerCase().includes(normalizedSearchAccessorySerial));

  return matchSerial && matchNombre && matchUsuario && matchCelular && matchEquipo && matchModelo && matchAccessories && matchAccessorySerial;
};
