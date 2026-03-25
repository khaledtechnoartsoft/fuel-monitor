"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, MapPin, Loader2, Info, Menu, ChevronRight } from "lucide-react";
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

  return (
    <div className="relative h-screen w-screen overflow-hidden text-foreground">
      {/* Search Header (Floating) */}
      <header className="absolute top-4 left-0 right-0 z-50 px-4 md:px-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3 backdrop-blur-xl bg-background/60 border border-white/10 rounded-full px-5 py-3 shadow-2xl">
            <MapPin className="text-secondary-foreground h-5 w-5" />
            <h1 className="font-bold text-lg hidden md:block italic tracking-tighter">FUEL MONITOR</h1>
            <div className="h-4 w-[1px] bg-white/20 mx-2 hidden md:block" />
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><div className="w-2 rounded-full aspect-square bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> Available</span>
              <span className="flex items-center gap-1.5"><div className="w-2 rounded-full aspect-square bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> No Stock</span>
              <span className="flex items-center gap-1.5"><div className="w-2 rounded-full aspect-square bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" /> Suspicious</span>
            </div>
          </div>

          <div className="md:flex items-center gap-4 hidden">
             <div className="bg-background/60 backdrop-blur-xl border border-white/10 rounded-full pl-5 pr-2 py-2 flex items-center gap-2 shadow-2xl">
                <input 
                  type="text" 
                  placeholder="Search Location..." 
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
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs">U</div>
                  )}
                  <div className="flex flex-col pr-1">
                    <span className="text-[10px] font-black leading-none">{session.user?.name?.toUpperCase()}</span>
                    <span className="text-[8px] text-primary font-bold">Reputation: {(session.user as any).trustScore || 10}</span>
                  </div>
                  <button onClick={() => signOut()} className="ml-1 opacity-50 hover:opacity-100 transition-opacity">
                     <Plus className="h-4 w-4 rotate-45" />
                  </button>
               </div>
             ) : (
               <button 
                onClick={() => signIn('google')}
                className="px-6 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
               >
                 Connect Account
               </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Map Component */}
      <div className="h-screen w-screen">
        <Map onLocationSelect={handleLocationSelect} reports={reports} />
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-10 right-10 z-50 flex flex-col gap-4">
        <button 
          onClick={() => setIsReporting(true)}
          className="group relative flex items-center justify-center h-16 w-16 bg-primary rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-primary/20 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          <Plus className="h-8 w-8 text-background font-bold" />
        </button>

        <button className="flex items-center justify-center h-12 w-12 bg-background/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:bg-white/10 transition-all">
          <Info className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Left Sidebar for Quick Activity (Desktop only) */}
      <aside className="absolute left-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-6 ">
        <div className="flex flex-col gap-4 backdrop-blur-2xl bg-black/40 border border-white/10 p-6 rounded-[2rem] shadow-2xl w-80">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-lg">Recent Reports</h2>
            <span className="text-primary text-xs font-semibold px-2 py-0.5 bg-primary/20 rounded-full border border-primary/30">Live</span>
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {reports.map((report) => (
              <div key={report.id} className="group p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className={clsx(
                    "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border",
                    report.status === 'AVAILABLE' && "text-green-400 bg-green-500/10 border-green-500/20",
                    report.status === 'NOT_AVAILABLE' && "text-red-400 bg-red-500/10 border-red-500/20",
                    report.status === 'SUSPICIOUS' && "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
                  )}>
                    {report.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-muted-foreground">2m ago</span>
                </div>
                <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{report.locationName}</h3>
                <p className="text-xs text-muted-foreground truncate">{report.description}</p>
                <div className="mt-3 flex items-center justify-between">
                   <div className="flex -space-x-1.5">
                      {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full border border-background bg-secondary" />)}
                      <span className="text-[10px] text-muted-foreground ml-3">+12 votes</span>
                   </div>
                   <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
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
