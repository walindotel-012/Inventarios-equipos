import React from 'react';
import * as IoIcons from 'react-icons/io5';
import { iconSizes, iconColors } from '../utils/icons';

/**
 * Componente Icon - Wrapper para React Icons
 * @param {string} name - Nombre del icono (ej: 'Menu', 'Home', 'Laptop')
 * @param {string} size - Tamaño: xs, sm, md, lg, xl
 * @param {string} color - Color: primary, success, warning, error, info, neutral o hex directo
 * @param {string} className - Clases CSS adicionales
 * @param {object} props - Props adicionales para el icono
 */
export const Icon = ({ 
  name = 'Home', 
  size = 'md', 
  color = 'neutral',
  className = '',
  style = {},
  ...props 
}) => {
  // Obtener el componente de icono de react-icons
  const IconComponent = IoIcons[`Io${name}`] || IoIcons.IoHomeOutline;
  
  // Convertir tamaño a píxeles
  const sizeValue = iconSizes[size] || iconSizes.md;
  
  // Obtener color
  const colorValue = iconColors[color] || color;
  
  const combinedStyle = {
    width: sizeValue,
    height: sizeValue,
    color: colorValue,
    ...style,
  };

  return (
    <IconComponent 
      style={combinedStyle}
      className={className}
      {...props}
    />
  );
};

export default Icon;
