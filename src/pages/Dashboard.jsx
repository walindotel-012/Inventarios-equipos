import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import KpiCard from '../components/dashboard/KpiCard';
import RecentActivityTable from '../components/dashboard/RecentActivityTable';
import DepartmentChart from '../components/dashboard/DepartmentChart';
import InventoryDonut from '../components/dashboard/InventoryDonut';
import AssignmentDonut from '../components/dashboard/AssignmentDonut';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import Icon from '../components/Icon';

const normalizeStatus = (status) => (typeof status === 'string' ? status.toLowerCase() : '');
const makePercent = (value, total) => (!total ? 0 : Math.round((value / total) * 100));

export default function Dashboard() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [equipos, setEquipos] = useState([]);
  const [celulares, setCelulares] = useState([]);
  const [accesorios, setAccesorios] = useState([]);
  const [nomenclaturas, setNomenclaturas] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [descargos, setDescargos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const unsubEquipos = onSnapshot(
      collection(db, 'equipos'),
      (snapshot) => {
        setEquipos(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (error) => {
        console.error('Error cargando equipos:', error);
        setLoading(false);
      }
    );

    const unsubCelulares = onSnapshot(
      collection(db, 'celulares'),
      (snapshot) => {
        setCelulares(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (error) => {
        console.error('Error cargando celulares:', error);
        setLoading(false);
      }
    );

    const unsubAccesorios = onSnapshot(
      collection(db, 'accesorios'),
      (snapshot) => {
        setAccesorios(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (error) => {
        console.error('Error cargando accesorios:', error);
        setLoading(false);
      }
    );

    const unsubNomenclaturas = onSnapshot(
      collection(db, 'nomenclaturas'),
      (snapshot) => {
        setNomenclaturas(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (error) => {
        console.error('Error cargando nomenclaturas:', error);
        setLoading(false);
      }
    );

    const unsubAsignaciones = onSnapshot(
      collection(db, 'asignaciones'),
      (snapshot) => {
        setAsignaciones(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (error) => {
        console.error('Error cargando asignaciones:', error);
        setLoading(false);
      }
    );

    const unsubDescargos = onSnapshot(
      collection(db, 'descargos'),
      (snapshot) => {
        setDescargos(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (error) => {
        console.error('Error cargando descargos:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubEquipos();
      unsubCelulares();
      unsubAccesorios();
      unsubNomenclaturas();
      unsubAsignaciones();
      unsubDescargos();
    };
  }, []);

  const equiposDisponibles = useMemo(
    () => equipos.filter((item) => !item.asignado || normalizeStatus(item.estado) === 'disponible').length,
    [equipos]
  );

  const celularesDisponibles = useMemo(
    () => celulares.filter((item) => !item.asignado || normalizeStatus(item.estado) === 'disponible').length,
    [celulares]
  );

  const accesoriosDisponibles = useMemo(
    () => accesorios.filter((item) => !item.asignado || normalizeStatus(item.estado) === 'disponible').length,
    [accesorios]
  );

  const totalDisponibles = equiposDisponibles + celularesDisponibles + accesoriosDisponibles;

  const asignadosCount = useMemo(() => {
    const equiposCount = equipos.filter((item) => item.asignado || normalizeStatus(item.estado) === 'asignado').length;
    const celularesCount = celulares.filter((item) => item.asignado || normalizeStatus(item.estado) === 'asignado').length;
    const accesoriosCount = accesorios.filter((item) => item.asignado || normalizeStatus(item.estado) === 'asignado').length;
    return equiposCount + celularesCount + accesoriosCount;
  }, [equipos, celulares, accesorios]);

  const mantenimientoCount = useMemo(() => {
    const valores = ['mantenimiento', 'revisión', 'revision', 'equipos en mantenimiento', 'en mantenimiento'];
    const equiposCount = equipos.filter((item) => valores.includes(normalizeStatus(item.estado))).length;
    const celularesCount = celulares.filter((item) => valores.includes(normalizeStatus(item.estado))).length;
    const accesoriosCount = accesorios.filter((item) => valores.includes(normalizeStatus(item.estado))).length;
    return equiposCount + celularesCount + accesoriosCount;
  }, [equipos, celulares, accesorios]);

  const inactivosCount = useMemo(() => {
    const valores = ['inactivo', 'retirado', 'baja'];
    const equiposCount = equipos.filter((item) => valores.includes(normalizeStatus(item.estado))).length;
    const celularesCount = celulares.filter((item) => valores.includes(normalizeStatus(item.estado))).length;
    const accesoriosCount = accesorios.filter((item) => valores.includes(normalizeStatus(item.estado))).length;
    return equiposCount + celularesCount + accesoriosCount;
  }, [equipos, celulares, accesorios]);

  const asignacionesActivas = useMemo(
    () => asignaciones.filter((item) => ['asignado', 'entregado', 'activo'].includes(normalizeStatus(item.estado)) || !item.estado).length,
    [asignaciones]
  );

  const asignacionesPendientes = useMemo(
    () => asignaciones.filter((item) => ['pendiente', 'por asignar', 'en espera'].includes(normalizeStatus(item.estado))).length,
    [asignaciones]
  );

  const asignacionesFinalizadas = useMemo(
    () => asignaciones.filter((item) => ['finalizado', 'descargado', 'completado'].includes(normalizeStatus(item.estado))).length,
    [asignaciones]
  );

  const recentActivity = useMemo(() => {
    const events = [];

    asignaciones.forEach((item) => {
      const date = item.fechaAsignacion || item.fechaEntrega || item.createdAt || item.fecha || '';
      events.push({
        id: `asignacion-${item.id}`,
        date,
        user: item.asignadoPor || item.usuario || item.nombre || 'Sistema',
        action: 'Asignación',
        detail: item.nombre
          ? `Equipo ${item.tipoEquipo || 'principal'} a ${item.nombre}`
          : item.codActivoFijo
          ? `Equipo ${item.codActivoFijo}`
          : 'Asignación registrada',
        color: 'bg-blue-100 text-blue-700',
        sortDate: new Date(date).getTime() || 0,
      });
    });

    descargos.forEach((item) => {
      const date = item.fechaDescargo || item.fechaRegistroDescargo || item.createdAt || item.fecha || '';
      events.push({
        id: `descargo-${item.id}`,
        date,
        user: item.usuarioDescargo || item.usuario || item.nombre || 'Sistema',
        action: 'Descargo',
        detail: item.codActivoFijo
          ? `Descargó ${item.codActivoFijo}`
          : item.serialCelular
          ? `Descargó ${item.serialCelular}`
          : 'Descargo registrado',
        color: 'bg-rose-100 text-rose-700',
        sortDate: new Date(date).getTime() || 0,
      });
    });

    return events
      .sort((a, b) => b.sortDate - a.sortDate)
      .slice(0, 4)
      .map(({ sortDate, ...rest }) => rest);
  }, [asignaciones, descargos]);

  const departmentData = useMemo(() => {
    const counts = asignaciones.reduce((acc, item) => {
      const key = item.sucursal || item.puesto || 'Sin área';
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [asignaciones]);

  const totalInventory = totalDisponibles + asignadosCount + mantenimientoCount + inactivosCount;
  const inventoryData = useMemo(
    () => [
      { name: 'Disponibles', value: totalDisponibles, percent: makePercent(totalDisponibles, totalInventory) },
      { name: 'Asignados', value: asignadosCount, percent: makePercent(asignadosCount, totalInventory) },
      { name: 'Mantenimiento', value: mantenimientoCount, percent: makePercent(mantenimientoCount, totalInventory) },
      { name: 'Inactivos', value: inactivosCount, percent: makePercent(inactivosCount, totalInventory) },
    ],
    [totalDisponibles, asignadosCount, mantenimientoCount, inactivosCount, totalInventory]
  );

  const assignmentTotal = asignacionesActivas + asignacionesPendientes + asignacionesFinalizadas;
  const assignmentData = useMemo(
    () => [
      { name: 'Activas', value: asignacionesActivas, percent: makePercent(asignacionesActivas, assignmentTotal) },
      { name: 'Pendientes', value: asignacionesPendientes, percent: makePercent(asignacionesPendientes, assignmentTotal) },
      { name: 'Finalizadas', value: asignacionesFinalizadas, percent: makePercent(asignacionesFinalizadas, assignmentTotal) },
    ],
    [asignacionesActivas, asignacionesPendientes, asignacionesFinalizadas, assignmentTotal]
  );

  const statCards = [
    {
      title: 'Equipos',
      value: equipos.length,
      subtitle: 'Total registrados',
      trend: 'Actualizado desde inventario',
      color: 'bg-emerald-100 text-emerald-700',
      iconBg: 'bg-blue-50',
      icon: <Icon name="LaptopOutline" size="sm" color="#2563eb" />,
    },
    {
      title: 'Celulares',
      value: celulares.length,
      subtitle: 'Total registrados',
      trend: 'Actualizado desde inventario',
      color: 'bg-emerald-100 text-emerald-700',
      iconBg: 'bg-emerald-50',
      icon: <Icon name="PhonePortraitOutline" size="sm" color="#059669" />,
    },
    {
      title: 'Nomenclaturas',
      value: nomenclaturas.length,
      subtitle: 'Total usuarios',
      trend: 'Actualizado desde registro real',
      color: 'bg-emerald-100 text-emerald-700',
      iconBg: 'bg-violet-50',
      icon: <Icon name="PeopleOutline" size="sm" color="#7c3aed" />,
    },
    {
      title: 'Accesorios',
      value: accesorios.length,
      subtitle: 'Total registrados',
      trend: 'Actualizado desde inventario',
      color: 'bg-rose-100 text-rose-700',
      iconBg: 'bg-orange-50',
      icon: <Icon name="Hammer" size="sm" color="#ea580c" />,
    },
  ];

  return (
    <DashboardLayout
      sidebar={<Sidebar activePath={location.pathname} />}
      header={<Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />}
      mobileSidebar={sidebarOpen ? (
        <div className="fixed inset-0 z-50 flex xl:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 h-full w-72 overflow-y-auto bg-white shadow-2xl">
            <Sidebar activePath={location.pathname} />
          </div>
        </div>
      ) : null}
      sidebarOpen={sidebarOpen}
    >
      <div className="space-y-6">
        <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Resumen general del sistema de gestión de inventario</h1>
              <p className="mt-2 text-sm text-slate-500">Todos los datos se generan a partir de la base de datos real del sistema.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-4">
          {statCards.map((card) => (
            <KpiCard key={card.title} {...card} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[60%_40%]">
          <RecentActivityTable activities={recentActivity} />
          <DepartmentChart data={departmentData} />
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <InventoryDonut data={inventoryData} />
          <AssignmentDonut data={assignmentData} />
          <AlertsPanel
            alerts={[
              {
                title: 'Equipos en mantenimiento',
                detail: `${mantenimientoCount} activos requieren revisión`,
                badge: mantenimientoCount,
                icon: 'WrenchOutline',
                color: 'bg-slate-100 text-slate-900',
              },
              {
                title: 'Asignaciones pendientes',
                detail: `${asignacionesPendientes} tareas sin completar`,
                badge: asignacionesPendientes,
                icon: 'ClockOutline',
                color: 'bg-amber-100 text-amber-900',
              },
              {
                title: 'Descargos registrados',
                detail: `${descargos.length} descargos totales`,
                badge: descargos.length,
                icon: 'AlertCircleOutline',
                color: 'bg-rose-100 text-rose-900',
              },
            ]}
          />
        </section>
      </div>
    </DashboardLayout>
  );
}
