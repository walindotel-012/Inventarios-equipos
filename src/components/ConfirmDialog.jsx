import { createPortal } from 'react-dom';
import Icon from './Icon';

export default function ConfirmDialog({ 
  title = '¿Estás seguro?', 
  message = '¿Estás seguro de que deseas eliminar este elemento?',
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  isDangerous = true
}) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 transform transition-all animate-in">
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            isDangerous ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            <Icon 
              name={isDangerous ? 'TrashOutline' : 'AlertCircleOutline'} 
              size="lg" 
              color={isDangerous ? '#ef4444' : '#f59e0b'}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="CloseOutline" size="sm" color="#374151" />
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-3 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
              isDangerous 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            <Icon 
              name={isDangerous ? 'TrashOutline' : 'AlertCircleOutline'} 
              size="sm" 
              color="white"
            />
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('portal') || document.body
  );
}
