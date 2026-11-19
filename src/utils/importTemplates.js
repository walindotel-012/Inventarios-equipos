import * as XLSX from 'xlsx';

const normalizeValue = (value) => String(value ?? '').trim();

const normalizeHeader = (value) => normalizeValue(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

export const readImportExcelFile = async (file, expectedHeaders) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!['xlsx', 'xls'].includes(extension)) {
    throw new Error('Selecciona un archivo Excel con extensión .xlsx o .xls.');
  }

  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
  const headers = rows[0] || [];

  if (headers.length !== expectedHeaders.length || headers.some((header, index) => normalizeHeader(header) !== normalizeHeader(expectedHeaders[index]))) {
    throw new Error(`Las columnas no coinciden. Usa la plantilla de ${expectedHeaders.join(' | ')}.`);
  }

  const dataRows = rows.slice(1).filter(row => row.some(value => normalizeValue(value)));
  if (dataRows.length === 0) {
    throw new Error('El archivo no contiene filas de datos para importar.');
  }

  return dataRows.map(row => expectedHeaders.map((_, index) => normalizeValue(row[index])).join('\t')).join('\n');
};

export const validateImportText = (text, options) => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const errors = [];
  const seen = new Map();

  lines.forEach((line, lineIndex) => {
    const rowNumber = lineIndex + 1;
    const fields = line.split('\t').map(normalizeValue);
    if (fields.length < options.minColumns || (options.maxColumns && fields.length > options.maxColumns)) {
      errors.push(`Fila ${rowNumber}: debe tener ${options.minColumns}${options.maxColumns && options.maxColumns !== options.minColumns ? `-${options.maxColumns}` : ''} columnas.`);
      return;
    }

    options.required?.forEach(index => {
      if (!fields[index]) errors.push(`Fila ${rowNumber}: el campo "${options.headers[index]}" es obligatorio.`);
    });

    Object.entries(options.allowed || {}).forEach(([index, values]) => {
      if (fields[index] && !values.includes(fields[index])) {
        errors.push(`Fila ${rowNumber}: "${options.headers[index]}" debe ser ${values.join(' o ')}.`);
      }
    });

    Object.entries(options.maxLength || {}).forEach(([index, maxLength]) => {
      if (fields[index].length > maxLength) errors.push(`Fila ${rowNumber}: "${options.headers[index]}" supera ${maxLength} caracteres.`);
    });

    options.uniqueGroups?.forEach(group => {
      const key = group.map(index => fields[index].toUpperCase()).join('|');
      if (group.some(index => fields[index])) {
        const groupName = group.map(index => options.headers[index]).join(' + ');
        if (seen.has(`${groupName}:${key}`)) errors.push(`Fila ${rowNumber}: ${groupName} está duplicado en la fila ${seen.get(`${groupName}:${key}`)}.`);
        else seen.set(`${groupName}:${key}`, rowNumber);
        if (options.existing?.[group.join(',')]?.has(key)) errors.push(`Fila ${rowNumber}: ${groupName} ya existe.`);
      }
    });
  });

  return errors;
};

export const downloadImportTemplate = (fileName, sheetName, headers, exampleRow, instructions) => {
  const dataSheet = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
  dataSheet['!cols'] = headers.map((header, index) => ({
    wch: Math.max(header.length + 2, String(exampleRow[index] || '').length + 2, 14),
  }));

  const instructionsSheet = XLSX.utils.aoa_to_sheet([
    ['Instrucciones de importación'],
    ...instructions.map(instruction => [instruction]),
  ]);
  instructionsSheet['!cols'] = [{ wch: 100 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, dataSheet, sheetName);
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instrucciones');
  XLSX.writeFile(workbook, fileName);
};
