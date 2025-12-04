// Utilidades para formateo y validación

export const formatDate = (date) => {
  if (!date) return '';
  if (date.toDate) {
    return date.toDate().toLocaleDateString('es-CO');
  }
  return new Date(date).toLocaleDateString('es-CO');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  if (date.toDate) {
    return date.toDate().toLocaleString('es-CO');
  }
  return new Date(date).toLocaleString('es-CO');
};

export const validateNetbios = (name) => {
  return name.length <= 14 && name.length > 0;
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const generateCode = (prefix, number) => {
  return `${prefix}-${String(number).padStart(4, '0')}`;
};

// Exportar datos a CSV
export const exportToCSV = (data, filename) => {
  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(row =>
      Object.values(row)
        .map(val => `"${val}"`)
        .join(',')
    )
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
};
