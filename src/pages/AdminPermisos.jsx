import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToastManager } from '../hooks/useToastManager';

const MODULOS_DISPONIBLES = [
  { id: 'equipos', nombre: 'Equipos', icon: 'LaptopOutline' },
  { id: 'celulares', nombre: 'Celulares', icon: 'PhonePortraitOutline' },
  { id: 'nomenclaturas', nombre: 'Nomenclaturas', icon: 'PeopleOutline' },
  { id: 'asignacion', nombre: 'Asignaciones', icon: 'LinkOutline' },
  { id: 'equipos-disponibles', nombre: 'Equipos Disponibles', icon: 'CheckmarkCircleOutline' },
  { id: 'hoja-entrega', nombre: 'Hojas de Entrega', icon: 'DocumentOutline' },
  { id: 'descargo', nombre: 'Descargos', icon: 'TrashOutline' },
];

export default function AdminPermisos() {
  const { currentUser, userPermissions } = useAuth();
  const { toast, showToast, hideToast } = useToastManager();
  const [usuarios, setUsuarios] = useState([]);
  const [permisos, setPermisos] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserNombre, setNewUserNombre] = useState('');
  const [newUserDepartamento, setNewUserDepartamento] = useState('');
  const [showClearDatabaseConfirm, setShowClearDatabaseConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Verificar si el usuario es admin
  const isAdmin = userPermissions?.isAdmin || currentUser?.email === 'walindotel@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      loadUsuarios();
    }
  }, [isAdmin]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      // Cargar permisos existentes
      const permisosSnapshot = await getDocs(collection(db, 'permisos'));
      const permisosData = {};
      const usuariosSet = new Set();

      permisosSnapshot.docs.forEach(doc => {
        const data = doc.data();
        permisosData[doc.id] = data;
        if (data.email) {
          usuariosSet.add({
            id: doc.id,
            email: data.email,
            nombre: data.nombre || data.email,
          });
        }
      });

      setPermisos(permisosData);
      setUsuarios(Array.from(usuariosSet));
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      showToast('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModulo = (userId, moduloId) => {
    const userPerms = permisos[userId] || { userId, rol: 'usuario', isAdmin: false, modulos: [] };
    const modulosActuales = userPerms.modulos || [];
    const nuevoModulos = modulosActuales.includes(moduloId)
      ? modulosActuales.filter(m => m !== moduloId)
      : [...modulosActuales, moduloId];

    setPermisos(prev => ({
      ...prev,
      [userId]: {
        ...userPerms,
        modulos: nuevoModulos
      }
    }));
  };

  const handleToggleAdmin = (userId) => {
    const userPerms = permisos[userId] || { userId, rol: 'usuario', isAdmin: false, modulos: [] };
    setPermisos(prev => ({
      ...prev,
      [userId]: {
        ...userPerms,
        isAdmin: !userPerms.isAdmin,
        rol: userPerms.isAdmin ? 'usuario' : 'admin',
        modulos: !userPerms.isAdmin ? [] : userPerms.modulos // Los admins no necesitan módulos específicos
      }
    }));
  };

  const handleGuardarPermisos = async (userId) => {
    try {
      setLoading(true);
      const userPerms = permisos[userId];
      
      // Validar que el email no esté vacío
      if (!userPerms.email || !userPerms.email.trim()) {
        showToast('El correo electrónico es requerido', 'error');
        setLoading(false);
        return;
      }

      const permDoc = doc(db, 'permisos', userId);

      await setDoc(permDoc, {
        userId,
        ...userPerms,
        actualizadoEn: new Date().toISOString(),
        actualizadoPor: currentUser.uid
      });

      // Actualizar la lista de usuarios con los nuevos datos
      setUsuarios(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, email: userPerms.email, nombre: userPerms.nombre }
          : u
      ));

      showToast('Permisos guardados exitosamente', 'success');
      setEditingUserId(null);
    } catch (error) {
      console.error('Error guardando permisos:', error);
      showToast('Error al guardar permisos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarUsuario = async () => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'permisos', deleteUserId));
      setPermisos(prev => {
        const newPermisos = { ...prev };
        delete newPermisos[deleteUserId];
        return newPermisos;
      });
      setUsuarios(prev => prev.filter(u => u.id !== deleteUserId));
      showToast('Usuario eliminado exitosamente', 'success');
      setShowDeleteConfirm(false);
      setDeleteUserId(null);
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      showToast('Error al eliminar usuario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarUsuario = async () => {
    if (!newUserEmail.trim()) {
      showToast('El correo electrónico es requerido', 'error');
      return;
    }

    try {
      setLoading(true);
      const userId = newUserEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      const newUserData = {
        userId,
        email: newUserEmail.toLowerCase(),
        nombre: newUserNombre || newUserEmail,
        departamento: newUserDepartamento,
        rol: 'usuario',
        isAdmin: false,
        modulos: [],
        creadoEn: new Date().toISOString(),
        creadoPor: currentUser.uid
      };

      await setDoc(doc(db, 'permisos', userId), newUserData);
      
      // Actualizar estado local
      setPermisos(prev => ({
        ...prev,
        [userId]: newUserData
      }));

      setUsuarios(prev => [...prev, {
        id: userId,
        email: newUserData.email,
        nombre: newUserData.nombre
      }]);

      setNewUserEmail('');
      setNewUserNombre('');
      setNewUserDepartamento('');
      setShowAddUser(false);
      showToast('Usuario agregado exitosamente', 'success');
    } catch (error) {
      console.error('Error agregando usuario:', error);
      showToast('Error al agregar usuario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearAllDatabase = async () => {
    try {
      setIsClearing(true);
      const collections = ['equipos', 'celulares', 'nomenclaturas', 'asignaciones', 'entregas', 'descargos', 'bitacora'];
      
      for (const collectionName of collections) {
        const querySnapshot = await getDocs(collection(db, collectionName));
        for (const document of querySnapshot.docs) {
          await deleteDoc(document.ref);
        }
      }
      
      setShowClearDatabaseConfirm(false);
      showToast('✓ Base de datos limpiada exitosamente', 'success');
    } catch (error) {
      console.error('Error al limpiar base de datos:', error);
      showToast('✗ Error al limpiar la base de datos: ' + error.message, 'error');
    } finally {
      setIsClearing(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="LockClosedOutline" size="lg" color="#dc2626" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">Solo los administradores pueden acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900 font-manrope">Gestión de Permisos</h1>
            <button
              onClick={() => setShowAddUser(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Icon name="AddOutline" size="md" color="white" />
              Agregar Usuario
            </button>
          </div>
          <p className="text-gray-600">Administra los permisos y módulos accesibles para cada usuario</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Icon name="SearchOutline" size="md" color="gray" className="absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Usuarios Grid */}
        {loading && !editingUserId ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="PeopleOutline" size="lg" color="gray" className="mx-auto mb-4" />
            <p className="text-gray-500">No hay usuarios con esos criterios</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {usuariosFiltrados.map(usuario => {
              const userPerms = permisos[usuario.id] || { userId: usuario.id, rol: 'usuario', isAdmin: false, modulos: [] };
              const isEditing = editingUserId === usuario.id;

              return (
                <div
                  key={usuario.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-transparent hover:border-blue-200 transition-all"
                >
                  {/* Usuario Header */}
                  <div className="p-6 border-b-2 border-gray-100">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Correo Electrónico
                          </label>
                          <input
                            type="email"
                            value={userPerms.email || ''}
                            onChange={(e) => setPermisos(prev => ({
                              ...prev,
                              [usuario.id]: { ...userPerms, email: e.target.value }
                            }))}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Nombre Completo
                          </label>
                          <input
                            type="text"
                            value={userPerms.nombre || ''}
                            onChange={(e) => setPermisos(prev => ({
                              ...prev,
                              [usuario.id]: { ...userPerms, nombre: e.target.value }
                            }))}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Departamento
                          </label>
                          <input
                            type="text"
                            value={userPerms.departamento || ''}
                            onChange={(e) => setPermisos(prev => ({
                              ...prev,
                              [usuario.id]: { ...userPerms, departamento: e.target.value }
                            }))}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Icon name="PersonOutline" size="md" color="primary" />
                            </div>
                            {usuario.nombre}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">{usuario.email}</p>
                          {userPerms.departamento && (
                            <p className="text-gray-500 text-sm mt-1">
                              <span className="font-semibold">Departamento:</span> {userPerms.departamento}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {userPerms.isAdmin && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rol y Permisos */}
                  <div className="p-6">
                    {/* Toggle Admin */}
                    <div className="mb-6">
                      <label className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border-2 border-red-200 cursor-pointer hover:bg-red-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={userPerms.isAdmin}
                          onChange={() => handleToggleAdmin(usuario.id)}
                          disabled={!isEditing}
                          className="w-5 h-5 text-red-600 rounded"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">Administrador</p>
                          <p className="text-sm text-gray-600">Acceso a todas las funciones y gestión de permisos</p>
                        </div>
                      </label>
                    </div>

                    {/* Módulos */}
                    {!userPerms.isAdmin && (
                      <div>
                        <p className="font-semibold text-gray-900 mb-4">Módulos Permitidos</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {MODULOS_DISPONIBLES.map(modulo => (
                            <label
                              key={modulo.id}
                              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                                userPerms.modulos.includes(modulo.id)
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-gray-50 border-gray-200'
                              } ${isEditing ? 'cursor-pointer hover:border-blue-300' : 'cursor-not-allowed opacity-60'}`}
                            >
                              <input
                                type="checkbox"
                                checked={userPerms.modulos.includes(modulo.id)}
                                onChange={() => handleToggleModulo(usuario.id, modulo.id)}
                                disabled={!isEditing}
                                className="w-5 h-5 text-blue-600 rounded"
                              />
                              <div className="flex items-center gap-2">
                                <Icon name={modulo.icon} size="sm" color={userPerms.modulos.includes(modulo.id) ? 'primary' : 'gray'} />
                                <span className="font-medium text-gray-900">{modulo.nombre}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="p-6 bg-gray-50 border-t-2 border-gray-100 flex justify-end gap-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => {
                            setEditingUserId(null);
                            loadUsuarios(); // Recargar para descartar cambios
                          }}
                          className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleGuardarPermisos(usuario.id)}
                          disabled={loading}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Icon name="CheckmarkOutline" size="sm" color="white" />
                          {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingUserId(usuario.id)}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Icon name="CreateOutline" size="sm" color="white" />
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            setDeleteUserId(usuario.id);
                            setShowDeleteConfirm(true);
                          }}
                          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Icon name="TrashOutline" size="sm" color="white" />
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Eliminar Usuario"
          message="¿Está seguro de que desea eliminar los permisos de este usuario? No podrá acceder a ningún módulo."
          onConfirm={handleEliminarUsuario}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeleteUserId(null);
          }}
          confirmText="Eliminar"
          cancelText="Cancelar"
          isDanger={true}
        />
      )}

      {/* Add User Modal */}
      {showAddUser && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setShowAddUser(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in scale-95">
              {/* Header */}
              <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Agregar Nuevo Usuario</h2>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icon name="CloseOutline" size="md" color="gray" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nombre (opcional)
                  </label>
                  <input
                    type="text"
                    value={newUserNombre}
                    onChange={(e) => setNewUserNombre(e.target.value)}
                    placeholder="Nombre completo"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Departamento (opcional)
                  </label>
                  <input
                    type="text"
                    value={newUserDepartamento}
                    onChange={(e) => setNewUserDepartamento(e.target.value)}
                    placeholder="Ej: Ventas, IT, RRHH"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 bg-gray-50 border-t-2 border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddUser(false)}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAgregarUsuario}
                  disabled={loading || !newUserEmail.trim()}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <Icon name="CheckmarkOutline" size="sm" color="white" />
                  {loading ? 'Agregando...' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        </>
      , document.getElementById('portal') || document.body
      )}

      {/* Danger Zone - Limpiar Base de Datos */}
      <div className="mt-12 pt-8 border-t-2 border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 font-manrope mb-4">Zona de Peligro</h2>
        <div className="card-saas bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 font-manrope mb-2 flex items-center gap-2">
                <Icon name="TrashOutline" size="md" color="#991b1b" />
                Limpiar Base de Datos
              </h3>
              <p className="text-red-700 text-sm mb-4">Elimina todos los registros del sistema incluyendo equipos, celulares, asignaciones y más. <span className="font-semibold">Esta acción no se puede deshacer.</span></p>
            </div>
            <button
              onClick={() => setShowClearDatabaseConfirm(true)}
              disabled={isClearing}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <Icon name="TrashOutline" size="sm" color="white" />
              {isClearing ? 'Limpiando...' : 'Limpiar Todo'}
            </button>
          </div>
        </div>
      </div>

      {/* Clear Database Confirmation Modal */}
      {showClearDatabaseConfirm && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Icon name="AlertCircleOutline" size="md" color="#991b1b" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">⚠️ Confirmar eliminación</h2>
            </div>
            
            <p className="text-gray-700 text-sm mb-2">Esta acción eliminará <span className="font-semibold">TODOS</span> los registros de:</p>
            <ul className="text-gray-600 text-sm space-y-1 mb-6 pl-4">
              <li>• Equipos</li>
              <li>• Celulares</li>
              <li>• Nomenclaturas</li>
              <li>• Asignaciones</li>
              <li>• Entregas</li>
              <li>• Descargos</li>
              <li>• Bitácora</li>
            </ul>

            <p className="text-red-700 font-semibold text-sm mb-6">⚠️ Esta acción NO se puede deshacer. Asegúrate de tener un respaldo.</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowClearDatabaseConfirm(false)}
                disabled={isClearing}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={clearAllDatabase}
                disabled={isClearing}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors"
              >
                {isClearing ? 'Limpiando...' : 'Eliminar Todo'}
              </button>
            </div>
          </div>
        </div>
      , document.getElementById('portal') || document.body
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
