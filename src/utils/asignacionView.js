const clean = (value) => String(value || '').trim();

const asset = (type, identifier, fallbackType) => {
  const explicitType = clean(type);
  const serial = clean(identifier);

  if (!explicitType && !serial) return null;

  const label = explicitType || fallbackType;

  return {
    key: `${label}-${serial}`.toLocaleLowerCase('es'),
    label,
    identifier: serial,
  };
};

export const getAssignmentAssets = (assignment) => {
  const assets = [
    asset(
      assignment.tipoEquipo,
      assignment.sn || assignment.codActivoFijo,
      'Equipo'
    ),
    asset(
      assignment.tipoEquipoSecundario,
      assignment.snSecundario || assignment.codActivoFijoSecundario,
      'Equipo secundario'
    ),
    asset(
      assignment.tipoEquipoCelular,
      assignment.serialCelular || assignment.imeiCelular || assignment.numeroCelular,
      'Celular / flota'
    ),
  ];

  const accessories = Array.isArray(assignment.accesorios)
    ? assignment.accesorios
    : [];

  accessories.forEach((accessory) => {
    assets.push(
      asset(
        accessory.tipoAccesorio,
        accessory.serial || accessory.numero || accessory.numeroSerie || accessory.codigoActivoFijo,
        'Accesorio'
      )
    );
  });

  if (accessories.length === 0 && (assignment.tipoAccesorio || assignment.accesorioNombre)) {
    assets.push(
      asset(
        assignment.tipoAccesorio || assignment.accesorioNombre,
        assignment.serialAccesorio || assignment.codigoActivoFijoAccesorio,
        'Accesorio'
      )
    );
  }

  const uniqueAssets = new Map();
  assets.filter(Boolean).forEach((item) => uniqueAssets.set(item.key, item));
  return [...uniqueAssets.values()];
};

export const formatAssignmentDate = (value) => {
  if (!value) return 'Sin fecha';

  const isoDate = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDate) return `${isoDate[3]}/${isoDate[2]}/${isoDate[1]}`;

  const date = value?.toDate?.() || new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('es-DO');
};
