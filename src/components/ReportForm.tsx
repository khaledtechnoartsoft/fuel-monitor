"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, Info, CheckCircle2, X, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

const reportSchema = z.object({
  status: z.enum(["AVAILABLE", "NOT_AVAILABLE", "SUSPICIOUS", "HOARDING", "OVERPRICED"]),
  locationType: z.enum(["PUMP", "SHOP", "WAREHOUSE"]).optional(),
  description: z.string().max(200).optional(),
  locationName: z.string().min(3, "Location name is required"),
  lat: z.number(),
  lng: z.number(),
  price: z.coerce.number().optional(),
  imageUrl: z.string().optional(),
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema) as any,
    defaultValues: {
      status: "AVAILABLE",
      locationType: "PUMP",
      lat: initialLocation?.lat ?? 23.7,
      lng: initialLocation?.lng ?? 90.4,
      locationName: initialLocation?.name ?? "Detecting address...",
    },
  });

  const selectedStatus = watch("status");
  const selectedLocationType = watch("locationType");

  const handleFormSubmit: SubmitHandler<ReportFormValues> = async (data) => {
    setSubmitting(true);
    try {
      await onSubmit({ ...data, imageUrl: imagePreview ?? undefined });
      setSuccess(true);
      setTimeout(() => { onClose(); }, 2000);
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
      <div className="p-8 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">রিপোর্ট করুন</h2>
            <span className="text-[10px] text-red-500 mt-1 font-black uppercase tracking-widest flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              Vigilante Report System
            </span>
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
            <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 mb-6 border border-teal-500/30">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black italic uppercase mb-2">ধন্যবাদ!</h3>
            <p className="text-muted-foreground text-sm">আপনার রিপোর্টটি জমা হয়েছে এবং শীঘ্রই লাইভ হবে।</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">

            {/* Location Pin */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">ঘটনাস্থল</label>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 hover:border-white/20 transition-all">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <input
                    {...register("locationName")}
                    className="bg-transparent border-none outline-none font-bold text-sm w-full focus:text-red-400 transition-colors"
                    placeholder="Location name..."
                  />
                  <p className="text-[10px] text-muted-foreground tabular-nums opacity-50">
                    {initialLocation?.lat.toFixed(5)}, {initialLocation?.lng.toFixed(5)}
                  </p>
                </div>
              </div>
              {errors.locationName && <p className="text-[10px] text-red-400 ml-1 italic">{errors.locationName.message}</p>}
            </div>

            {/* Location Type */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">প্রতিষ্ঠানের ধরন</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: "PUMP", label: "⛽ পাম্প" },
                  { id: "SHOP", label: "🏪 দোকান" },
                  { id: "WAREHOUSE", label: "📦 গুদাম" },
                ] as const).map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setValue("locationType", type.id)}
                    className={clsx(
                      "flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all text-xs font-black",
                      selectedLocationType === type.id
                        ? "bg-red-500/10 border-red-500/40 text-red-400"
                        : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Image Upload */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1 flex items-center justify-between">
                ঘটনাস্থলের ছবি
                <span className="text-[8px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-black border border-red-500/20">AI SECURE</span>
              </label>
              <div className="relative group overflow-hidden rounded-[1.5rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer min-h-[140px] flex items-center justify-center">
                {imagePreview ? (
                  <div className="absolute inset-0 z-0">
                    <img src={imagePreview} className="w-full h-full object-cover opacity-60" alt="preview" />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                    <div className="absolute top-3 right-3 bg-teal-500/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                      <span className="text-[9px] font-black text-white uppercase">Photo Added</span>
                    </div>
                  </div>
                ) : null}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setImagePreview(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="relative z-5 flex flex-col items-center gap-2 text-center p-6 pointer-events-none">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-red-500/10 group-hover:border-red-500/20 transition-all">
                    <Camera className="h-5 w-5 text-muted-foreground group-hover:text-red-500 transition-colors" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-white/40 group-hover:text-white transition-colors">ছবি আপলোড করুন</span>
                  <p className="text-[9px] text-muted-foreground opacity-50 italic">AI দিয়ে সিন্ডিকেটের প্রমাণ যাচাই হবে</p>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">প্রতি লিটার মূল্য (ঐচ্ছিক)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  {...register("price")}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-10 text-sm outline-none focus:border-red-500/50 transition-all"
                  placeholder="যেমন: ১২৫.৫০"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-sm">৳</span>
              </div>
            </div>

            {/* Status - Vigilance */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1 flex items-center gap-2">
                অবস্থা ও সিন্ডিকেট তথ্য
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              </label>
              <div className="flex flex-col gap-2.5">
                {([
                  { id: "AVAILABLE",     label: "✅ স্বাভাবিক বিক্রি",        desc: "তেল পাওয়া যাচ্ছে, দাম ঠিক আছে" },
                  { id: "HOARDING",      label: "🚫 মজুদদারি (Hoarding)",      desc: "তেল আছে কিন্তু বিক্রি করছে না" },
                  { id: "OVERPRICED",    label: "💰 অতিরিক্ত দাম",            desc: "সরকারি দামের চেয়ে বেশি রাখছে" },
                  { id: "NOT_AVAILABLE", label: "❌ সম্পূর্ণ শেষ",            desc: "পাম্পে / দোকানে তেল নেই" },
                ] as const).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setValue("status", s.id)}
                    className={clsx(
                      "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                      selectedStatus === s.id
                        ? "bg-white/10 border-white/20 ring-2 ring-red-500/20"
                        : "bg-white/5 border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className={clsx(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      selectedStatus === s.id ? "border-red-500" : "border-white/20"
                    )}>
                      {selectedStatus === s.id && <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />}
                    </div>
                    <div>
                      <div className={clsx("text-sm font-black", selectedStatus === s.id ? "text-white" : "text-muted-foreground group-hover:text-white")}>
                        {s.label}
                      </div>
                      <div className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-tight">
                        {s.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description & Quick Tags */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">অতিরিক্ত তথ্য (ঐচ্ছিক)</label>
              <div className="flex flex-wrap gap-2">
                {["অক্টেন পাওয়া যাচ্ছে", "ডিজেল শেষ", "শুধু মোটরসাইকেল", "দাম জানি না"].map((note) => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => setValue("description", note)}
                    className={clsx(
                      "text-[9px] font-black px-3 py-1.5 rounded-xl border transition-all",
                      watch("description") === note
                        ? "bg-red-500/20 border-red-500/40 text-red-400"
                        : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                    )}
                  >
                    {note}
                  </button>
                ))}
              </div>
              <textarea
                {...register("description")}
                className="w-full h-20 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs outline-none focus:border-red-500/50 transition-all resize-none"
                placeholder="আরও বিস্তারিত লিখুন..."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-5 bg-red-600 text-white font-black text-lg uppercase italic tracking-tighter rounded-3xl hover:scale-[1.02] active:scale-100 transition-all shadow-[0_8px_30px_rgba(239,68,68,0.3)] disabled:opacity-60 overflow-hidden relative"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {submitting ? (
                  <LoaderPulse />
                ) : (
                  <>রিপোর্ট জমা দিন <CheckCircle2 className="h-5 w-5" /></>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
            </button>

            <div className="flex items-center justify-center gap-2 text-muted-foreground pt-1">
              <Info className="h-3 w-3" />
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">সকল রিপোর্ট যাচাই করা হবে</p>
            </div>
          </form>
        )}
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
        className="w-1.5 h-1.5 bg-white rounded-full"
      />
    ))}
  </div>
);
