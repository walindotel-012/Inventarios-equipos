import { collection, addDoc, Timestamp, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Registra una acción en el audit log
 * @param {string} userId - ID del usuario que realiza la acción
 * @param {string} userName - Nombre del usuario
 * @param {string} action - Tipo de acción (CREATE, UPDATE, DELETE, etc)
 * @param {string} module - Módulo afectado (Equipos, Asignaciones, Celulares, etc)
 * @param {string} recordId - ID del registro afectado
 * @param {Object} details - Detalles adicionales de la acción
 */
export async function logAudit(userId, userName, action, module, recordId, details = {}) {
  try {
    const auditEntry = {
      userId,
      userName,
      action,
      module,
      recordId,
      details,
      timestamp: Timestamp.now(),
      ip: '', // Puede completarse si está disponible
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    const docRef = await addDoc(collection(db, 'auditLogs'), auditEntry);
    console.log('Audit log registered:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error registering audit log:', error);
    // No interrumpir la operación principal si falla el log
    return null;
  }
}

/**
 * Obtiene todos los logs de auditoría
 */
export async function getAuditLogs() {
  try {
    const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}

/**
 * Obtiene logs de auditoría filtrados por módulo
 */
export async function getAuditLogsByModule(module) {
  try {
    const q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(log => log.module === module);
  } catch (error) {
    console.error('Error fetching audit logs by module:', error);
    return [];
  }
}

/**
 * Obtiene logs de auditoría filtrados por usuario
 */
export async function getAuditLogsByUser(userId) {
  try {
    const q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(log => log.userId === userId);
  } catch (error) {
    console.error('Error fetching audit logs by user:', error);
    return [];
  }
}

/**
 * Obtiene logs de auditoría de un registro específico
 */
export async function getAuditLogsByRecord(recordId) {
  try {
    const q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(log => log.recordId === recordId);
  } catch (error) {
    console.error('Error fetching audit logs by record:', error);
    return [];
  }
}
