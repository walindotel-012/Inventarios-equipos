import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Cargar permisos del usuario
        await loadUserPermissions(user.uid);
      } else {
        setCurrentUser(null);
        setUserPermissions(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserPermissions = async (userId) => {
    try {
      console.log('🔍 Cargando permisos para usuario:', userId);
      
      // Primero intentar buscar por UID
      let permissionsDoc = await getDoc(doc(db, 'permisos', userId));
      
      // Si no encuentra por UID, buscar por email
      if (!permissionsDoc.exists()) {
        console.log('⚠️ No encontrado por UID, buscando por email...');
        const userEmail = auth.currentUser?.email?.toLowerCase();
        
        if (userEmail) {
          const q = query(collection(db, 'permisos'), where('email', '==', userEmail));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            permissionsDoc = querySnapshot.docs[0];
            console.log('✅ Usuario encontrado por email');
          }
        }
      }
      
      if (permissionsDoc.exists()) {
        const permsData = permissionsDoc.data();
        
        // Verificar si el usuario está revocado
        if (permsData.estado === 'revocado') {
          console.warn('⛔ Usuario revocado - Acceso denegado');
          // Revocar permisos completamente
          const revokedPermissions = {
            userId,
            rol: 'usuario',
            isAdmin: false,
            modulos: [],
            estado: 'revocado'
          };
          setUserPermissions(revokedPermissions);
          return;
        }
        
        console.log('✅ Permisos encontrados:', permsData);
        console.log('👑 ¿Es admin?:', permsData.isAdmin);
        console.log('📦 Módulos:', permsData.modulos);
        setUserPermissions(permsData);
      } else {
        console.warn('⚠️ No hay documento de permisos para este usuario');
        // Si no existe documento de permisos, crear uno por defecto (no admin)
        const defaultPermissions = {
          userId,
          rol: 'usuario',
          isAdmin: false,
          modulos: []
        };
        setUserPermissions(defaultPermissions);
      }
    } catch (error) {
      console.error('❌ Error cargando permisos:', error);
      console.error('Detalle del error:', error.message);
      setUserPermissions({
        userId,
        rol: 'usuario',
        isAdmin: false,
        modulos: []
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, logout, userPermissions }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}
