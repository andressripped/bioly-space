"use client";

import { useMemo } from "react";
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
} from "recharts";
import { Eye, MousePointerClick, TrendingUp, Users, Mail } from "lucide-react";

interface AnalyticsClientProps {
  rawData: any[];
  links: any[];
  subscribers: any[];
}

export default function AnalyticsClient({ rawData, links, subscribers }: AnalyticsClientProps) {
  // Procesar datos para KPI Cards
  const pageViews = rawData.filter((e) => e.event_type === "page_view").length;
  const linkClicks = rawData.filter((e) => e.event_type === "link_click").length;
  const shares = rawData.filter((e) => e.event_type === "share").length;
  
  // Calcular CTR general
  const ctr = pageViews > 0 ? ((linkClicks / pageViews) * 100).toFixed(1) : "0.0";

  // Agrupar por fecha para la gráfica de área (últimos 7 días)
  const chartData = useMemo(() => {
    const dataByDate: Record<string, { date: string; views: number; clicks: number }> = {};
    
    // Inicializar últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      dataByDate[dateStr] = { date: dateStr, views: 0, clicks: 0 };
    }

    rawData.forEach((event) => {
      const dateStr = new Date(event.created_at).toISOString().split("T")[0];
      if (dataByDate[dateStr]) {
        if (event.event_type === "page_view") dataByDate[dateStr].views += 1;
        if (event.event_type === "link_click") dataByDate[dateStr].clicks += 1;
      }
    });

    return Object.values(dataByDate).map(item => ({
      ...item,
      // Formato corto para el eje X
      dateShort: new Date(item.date).toLocaleDateString("es-ES", { day: '2-digit', month: 'short' })
    }));
  }, [rawData]);

  // Agrupar clicks por link
  const linkPerformance = useMemo(() => {
    const clicksByLink: Record<string, number> = {};
    rawData.filter(e => e.event_type === "link_click").forEach(event => {
      if (event.link_id) {
        clicksByLink[event.link_id] = (clicksByLink[event.link_id] || 0) + 1;
      }
    });

    return links.map(link => ({
      title: link.title,
      clicks: clicksByLink[link.id] || 0
    })).sort((a, b) => b.clicks - a.clicks).slice(0, 5); // Top 5
  }, [rawData, links]);

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

      {/* GRÁFICA PRINCIPAL */}
      <div className="bg-white dark:bg-[#111] p-6 lg:p-8 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
        <h3 className="text-lg font-bold mb-6">Tráfico de los últimos 7 días</h3>
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
              <BarChart data={linkPerformance} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#eeeeee" />
                <XAxis type="number" hide />
                <YAxis dataKey="title" type="category" axisLine={false} tickLine={false} width={150} tick={{ fontSize: 13, fill: '#555' }} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px' }} />
                <Bar dataKey="clicks" name="Clicks" fill="#111111" radius={[0, 8, 8, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#999999]">
              Aún no hay clicks en tus links.
            </div>
          )}
        </div>
      </div>

      {/* AUDIENCIA / SUSCRIPTORES */}
      <div className="bg-white dark:bg-[#111] p-6 lg:p-8 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Suscriptores ({subscribers.length})</h3>
          <button 
            className="text-xs font-bold uppercase tracking-widest text-[#555] hover:text-[#111] dark:text-[#a1a1aa] dark:hover:text-white transition-colors"
            onClick={() => {
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
    </div>
  );
}
