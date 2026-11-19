import React, { useState } from 'react';
import Icon from '../components/Icon';

/**
 * Página de Showcase de Iconos - Para desarrollo y referencia
 * Acceder a: http://localhost:5173/icon-showcase (si se agrega la ruta)
 */
export default function IconShowcase() {
  const [selectedSize, setSelectedSize] = useState('md');
  const [selectedColor, setSelectedColor] = useState('primary');

  const iconCategories = {
    'Navegación': [
      'MenuOutline', 'CloseOutline', 'GridOutline', 'SettingsOutline',
      'ChevronForwardOutline', 'ChevronBackOutline', 'ChevronUpOutline', 'ChevronDownOutline',
      'ExpandOutline'
    ],
    'Equipos': [
      'LaptopOutline', 'DesktopOutline', 'PhonePortraitOutline', 'TabletPortraitOutline',
      'BoxOutline', 'HardwareChipOutline'
    ],
    'Acciones': [
      'AddOutline', 'PencilOutline', 'TrashOutline', 'CheckmarkOutline',
      'DownloadOutline', 'UploadOutline', 'PrintOutline', 'SearchOutline',
      'FunnelOutline', 'CopyOutline'
    ],
    'Asignaciones': [
      'PersonOutline', 'PeopleOutline', 'LinkOutline', 'ArrowRedoOutline'
    ],
    'Estados': [
      'CheckmarkCircleOutline', 'AlertCircleOutline', 'InformationCircleOutline',
      'CloseCircleOutline', 'WarningOutline'
    ],
    'Documentos': [
      'DocumentOutline', 'DocumentTextOutline', 'BarChartOutline', 'DownloadOutline'
    ],
    'Otros': [
      'CalendarOutline', 'TimeOutline', 'LocationOutline', 'EyeOutline',
      'EyeOffOutline', 'HomeOutline'
    ]
  };

  const colors = {
    'primary': '#003399',
    'success': '#10b981',
    'warning': '#f59e0b',
    'error': '#ef4444',
    'info': '#3b82f6',
    'neutral': '#6b7280'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Icon Showcase</h1>
          <p className="text-gray-600">Galería de iconos disponibles con React Icons</p>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-12 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Selector de Tamaño */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Tamaño</label>
              <div className="flex gap-2 flex-wrap">
                {['xs', 'sm', 'md', 'lg', 'xl'].map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedSize === size
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Color */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Color</label>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(colors).map(([name, hex]) => (
                  <button
                    key={name}
                    onClick={() => setSelectedColor(name)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedColor === name
                        ? 'ring-2 ring-offset-2'
                        : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: hex,
                      color: 'white',
                      ringColor: hex
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Iconos por Categoría */}
        {Object.entries(iconCategories).map(([category, icons]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{category}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {icons.map(iconName => (
                <div key={iconName} className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all hover:border-gray-300">
                  <Icon
                    name={iconName}
                    size={selectedSize}
                    color={selectedColor}
                  />
                  <span className="text-xs font-medium text-gray-600 text-center break-words">
                    {iconName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Ejemplos de Uso */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ejemplos de Uso</h2>

          <div className="space-y-8">
            {/* Ejemplo 1: Botón con icono */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Botón con Icono</h3>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <Icon name="AddOutline" size="sm" color="white" />
                  Agregar
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  <Icon name="CheckmarkOutline" size="sm" color="white" />
                  Guardar
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  <Icon name="TrashOutline" size="sm" color="white" />
                  Eliminar
                </button>
              </div>
            </div>

            {/* Ejemplo 2: Tarjeta */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Tarjeta de Estadística</h3>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 w-full max-w-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <Icon name="LaptopOutline" size="lg" color="white" />
                  </div>
                  <Icon name="ChevronForwardOutline" size="sm" color="#93c5fd" />
                </div>
                <p className="text-sm text-blue-600 font-medium mb-1">Equipos</p>
                <p className="text-3xl font-bold text-blue-600">1,234</p>
              </div>
            </div>

            {/* Ejemplo 3: Lista con iconos */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Lista con Iconos de Estado</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Icon name="CheckmarkCircleOutline" size="sm" color="success" />
                  <span className="text-green-700">Equipo disponible</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Icon name="AlertCircleOutline" size="sm" color="warning" />
                  <span className="text-yellow-700">Equipo en mantenimiento</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <Icon name="CloseCircleOutline" size="sm" color="error" />
                  <span className="text-red-700">Equipo dañado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
