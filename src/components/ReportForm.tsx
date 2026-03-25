"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, Info, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

const reportSchema = z.object({
  status: z.enum(["AVAILABLE", "NOT_AVAILABLE", "SUSPICIOUS"]),
  description: z.string().min(10, "Please provide some more details (min 10 chars)").max(200),
  locationName: z.string().min(3, "Location name is required"),
  lat: z.number(),
  lng: z.number(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface ReportFormProps {
  onClose: () => void;
  onSubmit: (values: ReportFormValues) => Promise<void>;
  initialLocation?: { lat: number; lng: number; name?: string };
}

export default function ReportForm({ onClose, onSubmit, initialLocation }: ReportFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      status: "AVAILABLE",
      lat: initialLocation?.lat || 23.7,
      lng: initialLocation?.lng || 90.4,
      locationName: initialLocation?.name || "Detecting address...",
    },
  });

  const selectedStatus = watch("status");

  const handleFormSubmit = async (data: ReportFormValues) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-3xl"
    >
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">Submit Report</h2>
            <span className="text-xs text-muted-foreground mt-1 font-medium">Helping the community with real-time data</span>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
             <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 mb-6 border border-green-500/30">
               <CheckCircle2 className="h-10 w-10" />
             </div>
             <h3 className="text-2xl font-bold mb-2">Thank you!</h3>
             <p className="text-muted-foreground">Your report was successfully submitted and will be live shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Location Display */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Pin Location</label>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 group hover:border-white/20 transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shrink-0">
                   <MapPin className="h-6 w-6" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <input 
                    {...register("locationName")}
                    className="bg-transparent border-none outline-none font-bold text-sm w-full focus:text-primary transition-colors"
                    placeholder="Location name..."
                  />
                  <p className="text-[10px] text-muted-foreground tabular-nums opacity-60">
                    {initialLocation?.lat.toFixed(4)}, {initialLocation?.lng.toFixed(4)}
                  </p>
                </div>
              </div>
              {errors.locationName && <p className="text-[10px] text-red-400 ml-1 italic">{errors.locationName.message}</p>}
            </div>

            {/* Status Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Current Fuel Status</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "AVAILABLE", label: "Available", color: "bg-green-500", ring: "ring-green-500/20" },
                  { id: "NOT_AVAILABLE", label: "No Stock", color: "bg-red-500", ring: "ring-red-500/20" },
                  { id: "SUSPICIOUS", label: "Suspicious", color: "bg-yellow-500", ring: "ring-yellow-500/20" }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setValue("status", s.id as any)}
                    className={clsx(
                      "flex flex-col items-center justify-center gap-3 p-4 rounded-3xl border transition-all duration-300 relative group",
                      selectedStatus === s.id 
                        ? `bg-white/10 border-white/20 ${s.ring} ring-4` 
                        : "bg-white/5 border-white/5 hover:border-white/10"
                    )}
                  >
                    <motion.div 
                      animate={selectedStatus === s.id ? { scale: 1.2 } : { scale: 1 }}
                      className={clsx("w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]", s.color)} 
                    />
                    <span className={clsx(
                      "text-[10px] font-black uppercase tracking-tight",
                      selectedStatus === s.id ? "text-white" : "text-muted-foreground group-hover:text-white"
                    )}>
                      {s.label}
                    </span>
                    {selectedStatus === s.id && (
                      <motion.div layoutId="status-glow" className="absolute inset-0 bg-white/5 rounded-3xl pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Description Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Description & Details</label>
                <span className="text-[10px] text-muted-foreground opacity-40">{watch("description")?.length || 0}/200</span>
              </div>
              <textarea
                {...register("description")}
                className={clsx(
                  "w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-5 text-sm outline-none focus:border-primary/50 transition-all resize-none shadow-inner",
                  errors.description && "border-red-500/50"
                )}
                placeholder="Ex: There's a 2-hour queue for Octane, No Diesel available since last night."
              />
              {errors.description && <p className="text-[10px] text-red-400 ml-1 italic">{errors.description.message}</p>}
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
               <button
                type="submit"
                disabled={submitting}
                className="group relative w-full py-5 bg-primary text-background font-black text-xl uppercase italic tracking-tighter rounded-3xl hover:scale-[1.02] active:scale-100 transition-all shadow-[0_8px_30px_rgb(59,130,246,0.3)] disabled:opacity-70 disabled:grayscale overflow-hidden"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {submitting ? (
                    <LoaderPulse />
                  ) : (
                    <>
                      Confirm Submission
                      <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <CheckCircle2 className="h-5 w-5" />
                      </motion.div>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
          <Info className="h-3 w-3" />
          <p className="text-[9px] font-medium uppercase tracking-[0.2em] opacity-40">All reports are unverified user contributions</p>
        </div>
      </div>
    </motion.div>
  );
}

const LoaderPulse = () => (
   <div className="flex items-center gap-1">
     {[1, 2, 3].map((i) => (
       <motion.div
         key={i}
         animate={{ y: [0, -4, 0] }}
         transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
         className="w-1.5 h-1.5 bg-background rounded-full"
       />
     ))}
   </div>
);
