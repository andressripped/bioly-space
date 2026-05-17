"use client";

import { useMemo, useState, useEffect } from "react";
import UpgradeModal from "@/components/UpgradeModal";
import { createClient } from "@/utils/supabase/client";
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
import { Eye, MousePointerClick, TrendingUp, Users, Mail, Lock, Calendar, Globe, ExternalLink } from "lucide-react";

const COLORS = ['#111111', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

// Vanilla requestAnimationFrame rolling count animation (Ease-Out Cubic)
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 800; // ms
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
      const current = Math.floor(start + (end - start) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
}

function AnimatedFloat({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 800; // ms
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
      const current = start + (end - start) * ease;
      setDisplayValue(Number(current.toFixed(1)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayValue.toFixed(1)}%</span>;
}

interface AnalyticsClientProps {
  profileId: string;
  dailyData: any[];
  dimensionData: any[];
  sharesData: any[];
  links: any[];
  subscribers: any[];
  plan: string;
}

export default function AnalyticsClient({ 
  profileId,
  dailyData, 
  dimensionData, 
  sharesData, 
  links, 
  subscribers, 
  plan 
}: AnalyticsClientProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [timeRange, setTimeRange] = useState<7 | 30 | "all">(7);
  const [activeTab, setActiveTab] = useState<"general" | "advanced">("general");
  const [realtimeStatus, setRealtimeStatus] = useState<string>("CONNECTING");

  // Local state to support real-time WebSocket updates
  const [localDaily, setLocalDaily] = useState(dailyData);
  const [localDimension, setLocalDimension] = useState(dimensionData);
  const [localShares, setLocalShares] = useState(sharesData);

  useEffect(() => {
    setLocalDaily(dailyData);
    setLocalDimension(dimensionData);
    setLocalShares(sharesData);
  }, [dailyData, dimensionData, sharesData]);

  // Supabase Realtime Subscription
  useEffect(() => {
    const supabase = createClient();
    
    // Subscribe to new tracking rows added for this profile
    const channel = supabase
      .channel(`realtime-analytics-${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "analytics",
        },
        async () => {
          // Wait 500ms to ensure the database trigger has fully committed the aggregations
          setTimeout(async () => {
            // Fetch updated pre-aggregated summary tables in parallel to bypass PostgREST 1000 row limits
            const [
              { data: daily },
              { data: shares },
              { data: ref },
              { data: cou },
              { data: cit },
              { data: dev },
              { data: bro },
              { data: lin }
            ] = await Promise.all([
              supabase.from("analytics_daily_summary").select("date, views_count, clicks_count").eq("profile_id", profileId).order("date", { ascending: false }),
              supabase.from("analytics").select("created_at").eq("profile_id", profileId).eq("event_type", "share"),
              supabase.from("analytics_dimension_summary").select("date, dimension_value, event_type, count").eq("profile_id", profileId).eq("dimension_type", "referrer"),
              supabase.from("analytics_dimension_summary").select("date, dimension_value, event_type, count").eq("profile_id", profileId).eq("dimension_type", "country"),
              supabase.from("analytics_dimension_summary").select("date, dimension_value, event_type, count").eq("profile_id", profileId).eq("dimension_type", "city"),
              supabase.from("analytics_dimension_summary").select("date, dimension_value, event_type, count").eq("profile_id", profileId).eq("dimension_type", "device"),
              supabase.from("analytics_dimension_summary").select("date, dimension_value, event_type, count").eq("profile_id", profileId).eq("dimension_type", "browser"),
              supabase.from("analytics_dimension_summary").select("date, dimension_value, event_type, count").eq("profile_id", profileId).eq("dimension_type", "link"),
            ]);

            const dim = [
              ...(ref || []).map(d => ({ ...d, dimension_type: "referrer" })),
              ...(cou || []).map(d => ({ ...d, dimension_type: "country" })),
              ...(cit || []).map(d => ({ ...d, dimension_type: "city" })),
              ...(dev || []).map(d => ({ ...d, dimension_type: "device" })),
              ...(bro || []).map(d => ({ ...d, dimension_type: "browser" })),
              ...(lin || []).map(d => ({ ...d, dimension_type: "link" })),
            ];

            if (daily) setLocalDaily(daily);
            if (shares) setLocalShares(shares);
            setLocalDimension(dim);
          }, 500);
        }
      );
      
    channel.subscribe((status) => {
      setRealtimeStatus(status);
    });
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  // Filtrar datos según el rango de tiempo seleccionado
  const filteredDaily = useMemo(() => {
    if (timeRange === "all") return localDaily;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeRange);
    const cutoffStr = cutoff.toISOString().split("T")[0]; // YYYY-MM-DD
    return localDaily.filter(d => d.date >= cutoffStr);
  }, [localDaily, timeRange]);

  const filteredDimension = useMemo(() => {
    if (timeRange === "all") return localDimension;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeRange);
    const cutoffStr = cutoff.toISOString().split("T")[0]; // YYYY-MM-DD
    return localDimension.filter(d => d.date >= cutoffStr);
  }, [localDimension, timeRange]);

  const filteredShares = useMemo(() => {
    if (timeRange === "all") return localShares;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeRange);
    return localShares.filter(s => new Date(s.created_at) >= cutoff);
  }, [localShares, timeRange]);

  // Recalcular KPIs basados en el filtro
  const pageViews = filteredDaily.reduce((sum, d) => sum + (d.views_count || 0), 0);
  const linkClicks = filteredDaily.reduce((sum, d) => sum + (d.clicks_count || 0), 0);
  const shares = filteredShares.length;
  const ctr = pageViews > 0 ? (linkClicks / pageViews) * 100 : 0;

  // Agrupar por fecha para la gráfica de área
  const chartData = useMemo(() => {
    const dataByDate: Record<string, { date: string; views: number; clicks: number }> = {};
    const days = timeRange === "all" ? 30 : timeRange;
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      dataByDate[dateStr] = { date: dateStr, views: 0, clicks: 0 };
    }

    filteredDaily.forEach((event) => {
      const dateStr = event.date; // YYYY-MM-DD
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

  // --- DIMENSIONES AVANZADAS ---

  // Agrupar referrers con normalización y cálculo de Tráfico Directo
  const referrerData = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalKnownRef = 0;
    
    filteredDimension
      .filter(d => d.dimension_type === "referrer" && d.event_type === "page_view")
      .forEach(d => {
        let name = d.dimension_value || "Tráfico Directo";
        if (name.includes("instagram")) name = "Instagram";
        else if (name.includes("facebook")) name = "Facebook";
        else if (name.includes("twitter") || name.includes("t.co")) name = "Twitter / X";
        else if (name.includes("tiktok")) name = "TikTok";
        else if (name.includes("youtube")) name = "YouTube";
        else if (name.includes("linkedin")) name = "LinkedIn";
        else if (name.includes("google")) name = "Google Search";
        
        counts[name] = (counts[name] || 0) + (d.count || 0);
        totalKnownRef += d.count || 0;
      });
      
    // Tráfico Directo
    const directTraffic = Math.max(0, pageViews - totalKnownRef);
    if (directTraffic > 0) {
      counts["Tráfico Directo"] = (counts["Tráfico Directo"] || 0) + directTraffic;
    }
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredDimension, pageViews]);

  // Agrupar Países
  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredDimension
      .filter(d => d.dimension_type === "country" && d.event_type === "page_view")
      .forEach(d => {
        counts[d.dimension_value] = (counts[d.dimension_value] || 0) + (d.count || 0);
      });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredDimension]);

  // Agrupar Ciudades
  const cityData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredDimension
      .filter(d => d.dimension_type === "city" && d.event_type === "page_view")
      .forEach(d => {
        counts[d.dimension_value] = (counts[d.dimension_value] || 0) + (d.count || 0);
      });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredDimension]);

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
      {/* DIAGNOSTIC BADGE */}


      {/* KPI CARDS CON ANIMACIÓN DE ODÓMETRO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
          <div className="flex items-center gap-3 text-[#555555] dark:text-[#a1a1aa] mb-3">
            <Eye className="w-5 h-5" />
            <h3 className="text-sm font-semibold">Vistas de perfil</h3>
          </div>
          <p className="text-3xl font-bold">
            <AnimatedNumber value={pageViews} />
          </p>
        </div>
        
        <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
          <div className="flex items-center gap-3 text-[#555555] dark:text-[#a1a1aa] mb-3">
            <MousePointerClick className="w-5 h-5" />
            <h3 className="text-sm font-semibold">Clicks totales</h3>
          </div>
          <p className="text-3xl font-bold">
            <AnimatedNumber value={linkClicks} />
          </p>
        </div>

        <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
          <div className="flex items-center gap-3 text-[#555555] dark:text-[#a1a1aa] mb-3">
            <TrendingUp className="w-5 h-5" />
            <h3 className="text-sm font-semibold">CTR Promedio</h3>
          </div>
          <p className="text-3xl font-bold">
            <AnimatedFloat value={ctr} />
          </p>
        </div>

        <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
          <div className="flex items-center gap-3 text-[#555555] dark:text-[#a1a1aa] mb-3">
            <Users className="w-5 h-5" />
            <h3 className="text-sm font-semibold">Compartidos</h3>
          </div>
          <p className="text-3xl font-bold">
            <AnimatedNumber value={shares} />
          </p>
        </div>
      </div>

      {/* SEGMENTACIÓN DE VISTAS (TAB SELECTOR) */}
      <div className="flex border-b border-[#eeeeee] dark:border-[#222] mt-4">
        <button
          onClick={() => setActiveTab("general")}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all ${
            activeTab === "general"
              ? "border-black dark:border-white text-black dark:text-white"
              : "border-transparent text-[#999] hover:text-[#555] dark:hover:text-white"
          }`}
        >
          Vista General
        </button>
        <button
          onClick={() => {
            if (plan === "free") {
              setShowUpgradeModal(true);
              return;
            }
            setActiveTab("advanced");
          }}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "advanced"
              ? "border-black dark:border-white text-black dark:text-white"
              : "border-transparent text-[#999] hover:text-[#555] dark:hover:text-white"
          }`}
        >
          {plan === "free" && <Lock className="w-3.5 h-3.5 text-emerald-500" />}
          Vista Avanzada
        </button>
      </div>

      {/* CONTROLES DE TIEMPO (COMÚN PARA AMBAS VISTAS) */}
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

      {/* CONTENIDO DE TABS */}
      {activeTab === "general" ? (
        <div className="space-y-8">
          {/* GRÁFICA PRINCIPAL */}
          <div className="bg-white dark:bg-[#111] p-6 lg:p-8 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
            <h3 className="text-lg font-bold mb-6">Tráfico de los últimos {timeRange === "all" ? "30" : timeRange} días</h3>
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
        </div>
      ) : (
        // VISTA AVANZADA (PREMIUM FEATURES)
        <div className="space-y-8">
          
          {/* GEOGRAFÍA Y CANALES DE TRÁFICO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* PAÍSES */}
            <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
              <div className="flex items-center gap-3 text-black dark:text-white mb-6">
                <Globe className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold">Top Países</h3>
              </div>
              <div className="space-y-4">
                {countryData.length > 0 ? (
                  countryData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#555] dark:text-[#a1a1aa] w-5">{i + 1}.</span>
                        <span className="text-sm font-semibold">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold bg-gray-100 dark:bg-[#222] px-2.5 py-1 rounded-lg">
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-[#999] text-sm">Sin datos geográficos</div>
                )}
              </div>
            </div>

            {/* CIUDADES */}
            <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
              <div className="flex items-center gap-3 text-black dark:text-white mb-6">
                <Globe className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold">Top Ciudades</h3>
              </div>
              <div className="space-y-4">
                {cityData.length > 0 ? (
                  cityData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#555] dark:text-[#a1a1aa] w-5">{i + 1}.</span>
                        <span className="text-sm font-semibold">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold bg-gray-100 dark:bg-[#222] px-2.5 py-1 rounded-lg">
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-[#999] text-sm">Sin datos geográficos</div>
                )}
              </div>
            </div>

            {/* REFERRERS */}
            <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
              <div className="flex items-center gap-3 text-black dark:text-white mb-6">
                <ExternalLink className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold">Canales de Tráfico</h3>
              </div>
              <div className="space-y-4">
                {referrerData.length > 0 ? (
                  referrerData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#555] dark:text-[#a1a1aa] w-5">{i + 1}.</span>
                        <span className="text-sm font-semibold">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold bg-gray-100 dark:bg-[#222] px-2.5 py-1 rounded-lg">
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-[#999] text-sm">Sin datos de canales</div>
                )}
              </div>
            </div>

          </div>

          {/* TECNOLOGÍA (DISPOSITIVOS Y NAVEGADORES) */}
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

        </div>
      )}

      {/* AUDIENCIA / SUSCRIPTORES (COMÚN PARA AMBAS VISTAS) */}
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
        featureName="Métricas Avanzadas" 
      />
    </div>
  );
}
