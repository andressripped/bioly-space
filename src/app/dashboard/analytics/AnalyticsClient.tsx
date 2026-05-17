"use client";

import { useMemo, useState } from "react";
import UpgradeModal from "@/components/UpgradeModal";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";
import { Eye, MousePointerClick, TrendingUp, Users, Mail, Lock, Calendar } from "lucide-react";

const COLORS = ['#111111', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

interface AnalyticsClientProps {
  dailyData: any[];
  dimensionData: any[];
  sharesData: any[];
  links: any[];
  subscribers: any[];
  plan: string;
}

export default function AnalyticsClient({ dailyData, dimensionData, sharesData, links, subscribers, plan }: AnalyticsClientProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [timeRange, setTimeRange] = useState<7 | 30 | "all">(7);

  // Filtrar datos según el rango de tiempo seleccionado
  const filteredDaily = useMemo(() => {
    if (timeRange === "all") return dailyData;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeRange);
    const cutoffStr = cutoff.toISOString().split("T")[0]; // YYYY-MM-DD
    return dailyData.filter(d => d.date >= cutoffStr);
  }, [dailyData, timeRange]);

  const filteredDimension = useMemo(() => {
    if (timeRange === "all") return dimensionData;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeRange);
    const cutoffStr = cutoff.toISOString().split("T")[0]; // YYYY-MM-DD
    return dimensionData.filter(d => d.date >= cutoffStr);
  }, [dimensionData, timeRange]);

  const filteredShares = useMemo(() => {
    if (timeRange === "all") return sharesData;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeRange);
    return sharesData.filter(s => new Date(s.created_at) >= cutoff);
  }, [sharesData, timeRange]);

  // Recalcular KPIs basados en el filtro
  const pageViews = filteredDaily.reduce((sum, d) => sum + (d.views_count || 0), 0);
  const linkClicks = filteredDaily.reduce((sum, d) => sum + (d.clicks_count || 0), 0);
  const shares = filteredShares.length;
  const ctr = pageViews > 0 ? ((linkClicks / pageViews) * 100).toFixed(1) : "0.0";

  // Agrupar por fecha para la gráfica de área
  const chartData = useMemo(() => {
    const dataByDate: Record<string, { date: string; views: number; clicks: number }> = {};
    
    // Si es "Todo", graficamos los últimos 30 días para evitar saturar el gráfico de barritas,
    // pero las tarjetas superiores y demás métricas sí muestran el acumulado histórico completo.
    const days = timeRange === "all" ? 30 : timeRange;
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      dataByDate[dateStr] = { date: dateStr, views: 0, clicks: 0 };
    }

    filteredDaily.forEach((event) => {
      const dateStr = event.date; // already YYYY-MM-DD format from DB
      if (dataByDate[dateStr]) {
        dataByDate[dateStr].views += event.views_count || 0;
        dataByDate[dateStr].clicks += event.clicks_count || 0;
      }
    });

    return Object.values(dataByDate).map(item => ({
      ...item,
      dateShort: new Date(item.date).toLocaleDateString("es-ES", { day: '2-digit', month: 'short' })
    }));
  }, [filteredDaily, timeRange]);

  // Agrupar clicks por link
  const linkPerformance = useMemo(() => {
    const clicksByLink: Record<string, number> = {};
    
    filteredDimension
      .filter(d => d.dimension_type === "link" && d.event_type === "link_click")
      .forEach(d => {
        clicksByLink[d.dimension_value] = (clicksByLink[d.dimension_value] || 0) + (d.count || 0);
      });

    return links.map(link => ({
      title: link.title,
      clicks: clicksByLink[link.id] || 0
    })).sort((a, b) => b.clicks - a.clicks).slice(0, 5);
  }, [filteredDimension, links]);

  // Agrupar dispositivos
  const deviceData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    filteredDimension
      .filter(d => d.dimension_type === "device" && d.event_type === "page_view")
      .forEach(d => {
        counts[d.dimension_value] = (counts[d.dimension_value] || 0) + (d.count || 0);
      });
      
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredDimension]);

  // Agrupar navegadores
  const browserData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    filteredDimension
      .filter(d => d.dimension_type === "browser" && d.event_type === "page_view")
      .forEach(d => {
        counts[d.dimension_value] = (counts[d.dimension_value] || 0) + (d.count || 0);
      });
      
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredDimension]);


  return (
    <div className="space-y-8">
      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
          <div className="flex items-center gap-3 text-[#555555] dark:text-[#a1a1aa] mb-3">
            <Eye className="w-5 h-5" />
            <h3 className="text-sm font-semibold">Vistas de perfil</h3>
          </div>
          <p className="text-3xl font-bold">{pageViews}</p>
        </div>
        
        <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
          <div className="flex items-center gap-3 text-[#555555] dark:text-[#a1a1aa] mb-3">
            <MousePointerClick className="w-5 h-5" />
            <h3 className="text-sm font-semibold">Clicks totales</h3>
          </div>
          <p className="text-3xl font-bold">{linkClicks}</p>
        </div>

        <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
          <div className="flex items-center gap-3 text-[#555555] dark:text-[#a1a1aa] mb-3">
            <TrendingUp className="w-5 h-5" />
            <h3 className="text-sm font-semibold">CTR Promedio</h3>
          </div>
          <p className="text-3xl font-bold">{ctr}%</p>
        </div>

        <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
          <div className="flex items-center gap-3 text-[#555555] dark:text-[#a1a1aa] mb-3">
            <Users className="w-5 h-5" />
            <h3 className="text-sm font-semibold">Compartidos</h3>
          </div>
          <p className="text-3xl font-bold">{shares}</p>
        </div>
      </div>

      {/* CONTROLES DE TIEMPO */}
      <div className="flex items-center justify-end">
        <div className="bg-gray-100 dark:bg-[#111] p-1 rounded-xl inline-flex">
          <button 
            onClick={() => setTimeRange(7)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${timeRange === 7 ? "bg-white dark:bg-[#222] shadow-sm text-black dark:text-white" : "text-[#555] hover:text-black dark:hover:text-white"}`}
          >
            7 días
          </button>
          <button 
            onClick={() => {
              if (plan === "free") {
                setShowUpgradeModal(true);
                return;
              }
              setTimeRange(30);
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${timeRange === 30 ? "bg-white dark:bg-[#222] shadow-sm text-black dark:text-white" : "text-[#555] hover:text-black dark:hover:text-white"}`}
          >
            {plan === "free" && <Lock className="w-3 h-3 text-emerald-500" />}
            30 días
          </button>
          <button 
            onClick={() => {
              if (plan === "free") {
                setShowUpgradeModal(true);
                return;
              }
              setTimeRange("all");
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${timeRange === "all" ? "bg-white dark:bg-[#222] shadow-sm text-black dark:text-white" : "text-[#555] hover:text-black dark:hover:text-white"}`}
          >
            {plan === "free" && <Lock className="w-3 h-3 text-emerald-500" />}
            Todo
          </button>
        </div>
      </div>

      {/* GRÁFICA PRINCIPAL */}
      <div className="bg-white dark:bg-[#111] p-6 lg:p-8 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
        <h3 className="text-lg font-bold mb-6">Tráfico de los últimos {timeRange} días</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111111" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#111111" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eeeeee" />
              <XAxis dataKey="dateShort" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: '#fff', color: '#111' }}
              />
              <Area type="monotone" dataKey="views" name="Vistas" stroke="#111111" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LINKS TOP */}
      <div className="bg-white dark:bg-[#111] p-6 lg:p-8 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
        <h3 className="text-lg font-bold mb-6">Top Links (Más clickeados)</h3>
        <div className="h-[250px] w-full">
          {linkPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={linkPerformance} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#333333" strokeOpacity={0.2} />
                <XAxis type="number" hide />
                <YAxis dataKey="title" type="category" axisLine={false} tickLine={false} width={120} tick={{ fontSize: 13, fill: '#888' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(150, 150, 150, 0.1)' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: '#fff', color: '#111' }} 
                />
                <Bar dataKey="clicks" name="Clicks" fill="#10b981" radius={[0, 8, 8, 0]} barSize={24}>
                  <LabelList dataKey="clicks" position="right" fill="#888" fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#999999]">
              Aún no hay clicks en tus links.
            </div>
          )}
        </div>
      </div>

      {/* GRÁFICOS DE PASTEL (DISPOSITIVOS Y NAVEGADORES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#111] p-6 lg:p-8 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
          <h3 className="text-lg font-bold mb-6">Dispositivos</h3>
          <div className="h-[250px] w-full">
            {deviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#999999]">Sin datos</div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {deviceData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm text-[#555] dark:text-[#a1a1aa]">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="capitalize">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] p-6 lg:p-8 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
          <h3 className="text-lg font-bold mb-6">Navegadores</h3>
          <div className="h-[250px] w-full">
            {browserData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={browserData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {browserData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#999999]">Sin datos</div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {browserData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm text-[#555] dark:text-[#a1a1aa]">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="capitalize">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AUDIENCIA / SUSCRIPTORES */}
      <div className="bg-white dark:bg-[#111] p-6 lg:p-8 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Suscriptores ({subscribers.length})</h3>
          <button 
            className={`text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${
              plan === "business" 
                ? "text-[#555] hover:text-[#111] dark:text-[#a1a1aa] dark:hover:text-white" 
                : "text-emerald-600 dark:text-emerald-500 hover:opacity-80"
            }`}
            onClick={() => {
              if (plan !== "business") {
                setShowUpgradeModal(true);
                return;
              }
              const csvContent = "data:text/csv;charset=utf-8," + "Email,Fecha\n" + subscribers.map(s => `${s.email},${new Date(s.created_at).toLocaleDateString()}`).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "suscriptores.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            {plan !== "business" && <Lock className="w-3 h-3" />}
            Exportar CSV
          </button>
        </div>
        
        {subscribers.length > 0 ? (
          <div className="overflow-hidden border border-[#eeeeee] dark:border-[#222] rounded-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f9fafb] dark:bg-[#0a0a0a] border-b border-[#eeeeee] dark:border-[#222]">
                <tr>
                  <th className="px-4 py-3 font-semibold text-[#555] dark:text-[#a1a1aa]">Email</th>
                  <th className="px-4 py-3 font-semibold text-[#555] dark:text-[#a1a1aa] w-32">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeee] dark:divide-[#222]">
                {subscribers.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-[#151515] transition-colors">
                    <td className="px-4 py-3 font-medium">{sub.email}</td>
                    <td className="px-4 py-3 text-[#999999]">{new Date(sub.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed border-[#eeeeee] dark:border-[#222] rounded-2xl text-center text-[#999999]">
            <Mail className="w-8 h-8 mx-auto mb-3 text-[#cccccc] dark:text-[#444]" />
            Aún no tienes suscriptores. <br/> ¡Asegúrate de compartir tu perfil!
          </div>
        )}
      </div>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        featureName="Exportar Suscriptores" 
      />
    </div>
  );
}
