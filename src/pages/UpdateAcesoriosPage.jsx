import { useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function UpdateAcesoriosPage() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [acesoriosaActualizar, setAcesoriosaActualizar] = useState([]);

  const revisarAcesorios = async () => {
    try {
      setLoading(true);
      const accesoriosRef = collection(db, 'accesorios');
      const snapshot = await getDocs(accesoriosRef);

      const sinSerial = [];

      for (const docSnap of snapshot.docs) {
        const accesorio = docSnap.data();
        const tieneIdentificador = 
          accesorio.serial || 
          accesorio.numero || 
          accesorio.numeroSerie || 
          accesorio.imei;

        if (!tieneIdentificador) {
          sinSerial.push({
            id: docSnap.id,
            codigoActivoFijo: accesorio.codigoActivoFijo,
            tipoAccesorio: accesorio.tipoAccesorio,
          });
        }
      }

      setAcesoriosaActualizar(sinSerial);
      setResultado({
        tipo: 'revision',
        total: snapshot.docs.length,
        sinSerial: sinSerial.length,
        conSerial: snapshot.docs.length - sinSerial.length,
      });
    } catch (error) {
      console.error('Error:', error);
      setResultado({ tipo: 'error', mensaje: error.message });
    } finally {
      setLoading(false);
    }
  };

  const actualizarAcesorios = async () => {
    if (acesoriosaActualizar.length === 0) {
      alert('No hay accesorios para actualizar');
      return;
    }

    const confirmar = window.confirm(
      `¿Estás seguro de que deseas actualizar ${acesoriosaActualizar.length} accesorios?`
    );

    if (!confirmar) return;

    try {
      setLoading(true);
      let actualizados = 0;

      for (const accesorio of acesoriosaActualizar) {
        try {
          const nuevoSerial = accesorio.codigoActivoFijo;
          await updateDoc(doc(db, 'accesorios', accesorio.id), {
            serial: nuevoSerial,
          });
          actualizados++;
        } catch (error) {
          console.error(`Error actualizando ${accesorio.id}:`, error);
        }
      }

      setResultado({
        tipo: 'actualizacion',
        actualizados,
        total: acesoriosaActualizar.length,
      });
      setAcesoriosaActualizar([]);
    } catch (error) {
      console.error('Error:', error);
      setResultado({ tipo: 'error', mensaje: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">Actualizar Accesorios Sin Serial</h1>
          
          <div className="space-y-4">
            <button
              onClick={revisarAcesorios}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Revisando...' : '🔍 Revisar Accesorios'}
            </button>

            {resultado && resultado.tipo === 'revision' && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <p className="font-semibold">📊 Resultado de la Revisión:</p>
                <p>Total de accesorios: <strong>{resultado.total}</strong></p>
                <p>Sin serial: <strong className="text-red-600">{resultado.sinSerial}</strong></p>
                <p>Con serial: <strong className="text-green-600">{resultado.conSerial}</strong></p>
              </div>
            )}

            {acesoriosaActualizar.length > 0 && (
              <>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="font-semibold mb-3">⚠️ Accesorios a actualizar:</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {acesoriosaActualizar.map(acc => (
                      <div key={acc.id} className="text-sm bg-white p-2 rounded border border-yellow-200">
                        <strong>{acc.codigoActivoFijo}</strong> - {acc.tipoAccesorio}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={actualizarAcesorios}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                >
                  {loading ? 'Actualizando...' : '✅ Actualizar Ahora'}
                </button>
              </>
            )}

            {resultado && resultado.tipo === 'actualizacion' && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-semibold text-green-700">✅ ¡Actualización Completada!</p>
                <p>Accesorios actualizados: <strong>{resultado.actualizados}/{resultado.total}</strong></p>
              </div>
            )}

            {resultado && resultado.tipo === 'error' && (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-semibold text-red-700">❌ Error</p>
                <p>{resultado.mensaje}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
