import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { statsService } from '../../services/statsService';

const COLORES = {
  ventas: '#38bdf8',      // sky-400
  facturacion: '#34d399',  // emerald-400
  productos: '#a78bfa',   // violet-400
  servicios: '#fbbf24',    // amber-400
};

export default function SalesChartView() {
  const [agrupacion, setAgrupacion] = useState('dia');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [chartData, setChartData] = useState(null);
  const [cargando, setCargando] = useState(false);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const data = await statsService.getSalesChart({
        agrupacion,
        fecha_inicio: fechaInicio || undefined,
        fecha_fin: fechaFin || undefined,
      });
      setChartData(data);
    } catch (err) {
      console.error('Error al cargar datos de gráficos:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [agrupacion]);

  // Transformar datos para Recharts
  const dataFormateada = chartData
    ? chartData.labels.map((label, i) => ({
        periodo: label,
        ventas: chartData.ventas_count[i],
        facturacion: chartData.ventas_total[i],
        productos: chartData.productos_vendidos[i],
        servicios: chartData.servicios_vendidos[i],
      }))
    : [];

  // KPIs del período
  const totalVentas = dataFormateada.reduce((s, d) => s + d.ventas, 0);
  const totalFacturacion = dataFormateada.reduce((s, d) => s + d.facturacion, 0);
  const totalProductos = dataFormateada.reduce((s, d) => s + d.productos, 0);
  const totalServicios = dataFormateada.reduce((s, d) => s + d.servicios, 0);

  const formatCOP = (v) => `$${Number(v).toLocaleString('es-CO')}`;

  // Tooltip personalizado con tema oscuro
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl text-xs">
        <p className="font-bold text-white mb-1.5">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="flex justify-between gap-4">
            <span>{entry.name}:</span>
            <span className="font-mono font-bold">
              {entry.name === 'Facturación' ? formatCOP(entry.value) : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de Filtros */}
      <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl shadow-lg">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400 font-semibold">Agrupación</label>
            <select
              value={agrupacion}
              onChange={(e) => setAgrupacion(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="dia">Por Día</option>
              <option value="semana">Por Semana</option>
              <option value="mes">Por Mes</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400 font-semibold">Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400 font-semibold">Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <button
            onClick={cargarDatos}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
          >
            🔄 Filtrar
          </button>
        </div>
      </div>

      {/* KPI Cards del Período */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Ventas del Período</span>
            <span className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg text-sm">🧾</span>
          </div>
          <p className="text-2xl font-black text-white mt-2">{totalVentas}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">transacciones completadas</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Facturación Total</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm">💰</span>
          </div>
          <p className="text-2xl font-black text-white mt-2">{formatCOP(totalFacturacion)}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">ingresos del período</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Productos Vendidos</span>
            <span className="p-1.5 bg-violet-500/10 text-violet-400 rounded-lg text-sm">💻</span>
          </div>
          <p className="text-2xl font-black text-white mt-2">{totalProductos}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">unidades vendidas</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Servicios Prestados</span>
            <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-sm">🛠️</span>
          </div>
          <p className="text-2xl font-black text-white mt-2">{totalServicios}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">servicios realizados</p>
        </div>
      </div>

      {cargando ? (
        <div className="p-12 text-center text-slate-400">
          <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
          <p className="text-sm">Cargando datos de ventas...</p>
        </div>
      ) : dataFormateada.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 p-12 rounded-2xl text-center text-slate-400">
          <span className="text-4xl block mb-3">📊</span>
          <p className="text-base font-bold text-slate-300">Sin datos de ventas en este período</p>
          <p className="text-xs text-slate-500 mt-1">Ajusta el rango de fechas o la agrupación.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Gráfico de Barras: Cantidad de Ventas + Productos */}
          <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl shadow-lg">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span>📊</span>
              <span>Ventas por Período</span>
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dataFormateada} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="periodo" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="ventas" name="Ventas" fill={COLORES.ventas} radius={[6, 6, 0, 0]} />
                <Bar dataKey="productos" name="Productos" fill={COLORES.productos} radius={[6, 6, 0, 0]} />
                <Bar dataKey="servicios" name="Servicios" fill={COLORES.servicios} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Líneas: Tendencia de Facturación */}
          <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl shadow-lg">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span>📈</span>
              <span>Tendencia de Facturación</span>
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dataFormateada} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="periodo" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Line
                  type="monotone"
                  dataKey="facturacion"
                  name="Facturación"
                  stroke={COLORES.facturacion}
                  strokeWidth={2.5}
                  dot={{ fill: COLORES.facturacion, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
