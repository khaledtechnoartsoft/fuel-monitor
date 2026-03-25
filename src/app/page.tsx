"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, MapPin, Loader2, Info, Menu, ChevronRight, CheckCircle2, Trophy } from "lucide-react";
import { clsx } from "clsx";
import { useSession, signIn, signOut } from "next-auth/react";
import ReportForm from "@/components/ReportForm";
import axios from "axios";

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-background/50">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
    </div>
  ),
});

export default function Home() {
  const { data: session } = useSession();
  const [isReporting, setIsReporting] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{lat: number, lng: number} | null>(null);

  // Fetch reports on mount
  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/reports");
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      // Fallback data if API fails (e.g. before DB is setup)
      setReports([
        { id: "1", lat: 23.750, lng: 90.410, status: "AVAILABLE", locationName: "Shahbagh Petrol Pump", description: "Queue is moderate but fuel is available.", createdAt: new Date().toISOString() },
        { id: "2", lat: 23.770, lng: 90.400, status: "NOT_AVAILABLE", locationName: "Mohakhali Filling Station", description: "Completely out of stock since morning.", createdAt: new Date().toISOString() },
        { id: "3", lat: 23.790, lng: 90.420, status: "SUSPICIOUS", locationName: "Gulshan Filling Station", description: "Rumors about black market selling, hoarding suspected.", createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
    setIsReporting(true);
  };

  const handleReportSubmit = async (values: any) => {
    try {
      await axios.post("/api/reports", {
        ...values,
        userId: (session?.user as any)?.id || "anonymous-user-id"
      });
      fetchReports();
    } catch (err) {
      console.error("Failed to submit report:", err);
      throw err;
    }
  };

  const [filter, setFilter] = useState("ALL");

  const filteredReports = reports.filter((r) => {
    if (filter === "ALL") return true;
    return r.status === filter;
  });

  return (
    <div className="relative h-screen w-screen overflow-hidden text-foreground">
      {/* Search Header (Floating) */}
      <header className="absolute top-4 left-0 right-0 z-50 px-4 md:px-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3 backdrop-blur-xl bg-background/60 border border-white/10 rounded-full px-5 py-3 shadow-2xl">
            <MapPin className="text-red-500 h-5 w-5" />
            <h1 className="font-black text-xl hidden md:block italic tracking-tighter">FUEL VIGILANTE</h1>
            <div className="h-4 w-[1px] bg-white/20 mx-2 hidden md:block" />
            <div className="flex items-center gap-5 text-[10px] font-black uppercase tracking-widest overflow-x-auto no-scrollbar">
              <span className="flex items-center gap-2 whitespace-nowrap"><div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" /> মজুদdari</span>
              <span className="flex items-center gap-2 whitespace-nowrap"><div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" /> high price</span>
              <span className="flex items-center gap-2 whitespace-nowrap"><div className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" /> normal sales</span>
            </div>
          </div>

          <div className="md:flex items-center gap-4 hidden">
             <div className="bg-background/60 backdrop-blur-xl border border-white/10 rounded-full pl-5 pr-2 py-2 flex items-center gap-2 shadow-2xl">
                <input 
                  type="text" 
                  placeholder="পাম্প বা দোকান খুঁজুন..." 
                  className="bg-transparent border-none outline-none text-xs w-48 focus:w-64 transition-all duration-300 font-medium"
                />
                <button className="p-2 bg-primary rounded-full hover:scale-105 active:scale-95 transition-all text-background font-bold shadow-lg">
                  <Search className="h-4 w-4" />
                </button>
             </div>
             
             {session ? (
               <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full pl-1.5 pr-4 py-1.5 shadow-2xl">
                  {session.user?.image ? (
                    <img src={session.user.image} className="w-8 h-8 rounded-full border border-white/20" alt="pfp" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs uppercase italic">{session.user?.name?.[0]}</div>
                  )}
                  <div className="flex flex-col pr-1">
                    <span className="text-[10px] font-black leading-none">{session.user?.name?.toUpperCase()}</span>
                    <span className="text-[8px] text-red-500 font-black tracking-widest uppercase italic">Vigilante Rank #1</span>
                  </div>
                  <button onClick={() => signOut()} className="ml-1 opacity-50 hover:opacity-100 transition-opacity">
                     <Plus className="h-4 w-4 rotate-45" />
                  </button>
               </div>
             ) : (
               <button 
                onClick={() => signIn('google')}
                className="px-6 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
               >
                 Sign for Justice
               </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Map Component */}
      <div className="h-screen w-screen">
        <Map onLocationSelect={handleLocationSelect} reports={filteredReports} />
      </div>

      {/* Stats Bar (Justice Themed) */}
      <div className="absolute top-[88px] left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center gap-6 backdrop-blur-md bg-black/30 border border-white/5 rounded-2xl px-8 py-3 shadow-xl">
         <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">তদন্তাধীন রিপোর্ট</span>
            <span className="text-sm font-black text-white">{reports.length}</span>
         </div>
         <div className="h-8 w-[1px] bg-white/10" />
         <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">মজুদদারি সনাক্ত</span>
            <span className="text-sm font-black text-red-500">{reports.filter(r => r.status === 'HOARDING').length}</span>
         </div>
         <div className="h-8 w-[1px] bg-white/10" />
         <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">সিন্ডিকেট এলার্ট</span>
            <span className="text-sm font-black text-orange-400">{reports.filter(r => r.status === 'OVERPRICED').length}</span>
         </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-10 right-10 z-50 flex flex-col gap-4">
        <button 
          onClick={() => setIsReporting(true)}
          className="group relative flex flex-col items-center justify-center p-4 bg-red-600 rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ring-8 ring-red-500/10 overflow-hidden min-w-[140px]"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
          <Plus className="h-6 w-6 text-white mb-1" />
          <span className="text-[10px] font-black text-white uppercase tracking-tighter">রিপোর্ট করুন</span>
        </button>

        <button className="flex items-center justify-center h-12 w-12 bg-background/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:bg-white/10 transition-all">
          <Info className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Left Sidebar for Corruption Monitoring */}
      <aside className="absolute left-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-6 ">
        <div className="flex flex-col gap-4 backdrop-blur-3xl bg-black/50 border border-white/5 p-6 rounded-[2.5rem] shadow-2xl w-80 ring-1 ring-white/10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-black text-xl italic tracking-tighter uppercase text-red-500">Live Reports</h2>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Vigilance Filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
             {["ALL", "HOARDING", "OVERPRICED", "AVAILABLE"].map((f) => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={clsx(
                    "text-[8px] font-black uppercase tracking-tight px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap",
                    filter === f ? "bg-red-600 text-white border-red-600" : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10"
                  )}
                >
                  {f === "ALL" ? "সবগুলো" : f === "HOARDING" ? "মজুদদারি" : f === "OVERPRICED" ? "বেশি দাম" : "স্বাভাবিক"}
                </button>
             ))}
          </div>
          
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar no-scrollbar scroll-smooth">
            {filteredReports.map((report) => (
              <div key={report.id} className="group p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className={clsx(
                    "text-[8px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg border",
                    report.status === 'AVAILABLE' && "text-teal-400 bg-teal-500/10 border-teal-500/20",
                    report.status === 'NOT_AVAILABLE' && "text-slate-400 bg-slate-500/10 border-slate-500/20",
                    report.status === 'HOARDING' && "text-red-400 bg-red-500/10 border-red-500/20 animate-pulse",
                    report.status === 'OVERPRICED' && "text-orange-400 bg-orange-500/10 border-orange-500/20",
                  )}>
                    {report.status === 'AVAILABLE' ? '✅ NORMAL' : report.status === 'HOARDING' ? '🚫 HOARDING' : report.status === 'OVERPRICED' ? '💰 OVERPRICED' : '❌ CLOSED'}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium opacity-60">Live</span>
                </div>

                <div className="flex items-start justify-between gap-3">
                   <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] opacity-60">{report.locationType === 'SHOP' ? '🏪' : '⛽'}</span>
                        <h3 className="font-bold text-sm tracking-tight text-white/90 group-hover:text-red-400 transition-colors uppercase">{report.locationName}</h3>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed opacity-80">{report.description}</p>
                   </div>
                   <div className="p-2 bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center justify-center min-w-[50px]">
                      <span className="text-[8px] font-bold text-muted-foreground uppercase leading-none mb-1">Price</span>
                      <span className={clsx(
                        "text-xs font-black leading-none",
                        report.price && report.price > 100 ? "text-red-500" : "text-teal-400"
                      )}>৳{report.price || '--'}</span>
                   </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                   <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
                      <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                      <span className="text-[9px] text-muted-foreground font-bold italic">Source: Crowdsourced</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* Vigilante Leaderboard */}
          <div className="mt-4 pt-6 border-t border-white/5">
             <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">TOP VIGILANTES</span>
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
             </div>
             <div className="space-y-3">
                {reports.slice(0, 3).map((r, i) => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                     <div className="flex items-center gap-3">
                        <div className={clsx(
                          "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black italic",
                          i === 0 ? "bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-white/10 text-white"
                        )}>{i+1}</div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black uppercase text-white/80 tracking-tight leading-none mb-1">User_{r.userId.slice(0,4)}</span>
                           <span className="text-[8px] font-bold text-muted-foreground opacity-60">Verified reports: 12</span>
                        </div>
                     </div>
                     <span className="text-[10px] font-black text-teal-400 px-2.5 py-1 bg-teal-400/10 rounded-lg border border-teal-400/20">PT: 1250</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </aside>

      {/* Report Modal Component */}
      <AnimatePresence>
        {isReporting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <ReportForm 
              onClose={() => setIsReporting(false)} 
              onSubmit={handleReportSubmit}
              initialLocation={selectedCoords || { lat: 23.7, lng: 90.4 }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Bar (Mobile) */}
      <nav className="absolute bottom-6 left-6 right-6 z-50 lg:hidden flex items-center justify-between p-2 bg-background/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl">
         <div className="flex items-center gap-4 px-4 py-2">
            <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center text-primary font-black italic">F</div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold leading-none uppercase text-muted-foreground">Fuel Crisis</span>
              <span className="text-xs font-black tracking-tight uppercase">Live Monitor</span>
            </div>
         </div>
      </nav>

      {/* Aesthetic Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
    </div>
  );
}
