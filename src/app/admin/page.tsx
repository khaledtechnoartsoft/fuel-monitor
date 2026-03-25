"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Trash2, XCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { clsx } from "clsx";
import axios from "axios";

export default function AdminPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const { data } = await axios.get("/api/admin/reports");
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user && (session.user as any).role === "ADMIN") {
      fetchReports();
    }
  }, [session]);

  const toggleVerify = async (id: string, current: boolean) => {
    await axios.put("/api/admin/reports", { id, isVerified: !current });
    fetchReports();
  };

  const deleteReport = async (id: string) => {
    if (confirm("পাবলিকলি এটা ডিলিট করবেন?")) {
      await axios.delete(`/api/admin/reports?id=${id}`);
      fetchReports();
    }
  };

  if (!session || (session.user as any).role !== "ADMIN") {
    return (
       <div className="h-screen flex items-center justify-center bg-black text-red-500 font-black flex-col gap-4">
         <XCircle className="h-20 w-20" />
         <h1 className="text-2xl uppercase tracking-[0.5em] italic">Access Denied: Only Vigilante Council Admins</h1>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex items-center justify-between border-b border-red-500/20 pb-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center">
                 <ShieldCheck className="text-white h-7 w-7" />
              </div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase">Admin Surveillance Core</h1>
           </div>
           <div className="text-right">
              <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Total Active Investigations</span>
              <span className="text-3xl font-black text-red-500">{reports.length}</span>
           </div>
        </header>

        {loading ? (
          <div className="animate-pulse space-y-4">
             {[1,2,3].map(i => <div key={i} className="h-24 bg-red-600/5 border border-red-500/10 rounded-3xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div key={report.id} className={clsx(
                "group p-6 rounded-[2.5rem] border transition-all duration-300 relative overflow-hidden",
                report.isVerified ? "bg-teal-500/5 border-teal-500/20 shadow-[0_0_30px_rgba(20,184,166,0.05)]" : "bg-red-500/5 border-red-500/20"
              )}>
                <div className="flex items-center justify-between mb-4">
                  <span className={clsx(
                    "text-[8px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-widest",
                    report.status === 'HOARDING' ? 'text-red-400 bg-red-400/10 border-red-400/20 animate-pulse' : 'text-orange-400 bg-orange-400/10 border-orange-400/20'
                  )}>
                    {report.status}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleVerify(report.id, report.isVerified)}
                      className={clsx(
                        "p-2 rounded-xl border transition-all",
                        report.isVerified ? "bg-teal-500 text-black border-teal-400" : "bg-black border-white/10 hover:border-teal-400"
                      )}
                    >
                      <Check className="h-4 w-4 font-black" />
                    </button>
                    <button 
                      onClick={() => deleteReport(report.id)}
                      className="p-2 bg-black border border-white/10 hover:bg-red-600 hover:border-red-500 rounded-xl transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                   <h3 className="font-black text-lg uppercase tracking-tight mb-1 group-hover:text-red-500 transition-colors">{report.locationName}</h3>
                   <p className="text-[10px] text-muted-foreground opacity-70 leading-relaxed italic">"{report.description}"</p>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-muted-foreground uppercase">Reporter</span>
                      <span className="text-xs font-black">{report.user?.name || "Anonymous Witness"}</span>
                   </div>
                   <div className="flex flex-col text-right">
                      <span className="text-[8px] font-bold text-muted-foreground uppercase">Suspect Score</span>
                      <span className="text-xs font-black text-orange-400">🚨 Critical</span>
                   </div>
                </div>

                {report.isVerified && (
                   <div className="absolute -top-10 -right-10 h-20 w-20 bg-teal-500 rotate-45 flex items-end justify-center pb-2 opacity-20">
                      <Check className="h-5 w-5 text-black -rotate-45" />
                   </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
