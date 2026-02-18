"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, Phone, Briefcase, ArrowLeft, Calendar, 
  Clock, Heart, Sparkles, Loader2, Share2 
} from 'lucide-react';

export default function DetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('entries').select('*').eq('id', id).single();
      if (data) setPerson(data);
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-emerald-500" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* MINIMAL NAV */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={22} className="text-slate-600" />
          </button>
          <span className="font-black text-[10px] tracking-[0.3em] uppercase text-slate-400">Profile View</span>
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Share2 size={20} className="text-slate-600" />
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-8">
        {/* IMAGE GALLERY - BENTO STYLE */}
        <div className="grid grid-cols-12 gap-3 h-[320px] md:h-[480px]">
          <div className="col-span-8 overflow-hidden rounded-[2.5rem] shadow-2xl shadow-slate-200">
            <img src={person.photo_1} className="w-full h-full object-cover" alt="Primary" />
          </div>
          <div className="col-span-4 flex flex-col gap-3">
            <div className="flex-1 overflow-hidden rounded-[2.5rem] shadow-lg">
              <img src={person.photo_2 || person.photo_1} className="w-full h-full object-cover grayscale-[0.3]" alt="Secondary" />
            </div>
            {/* COMPACT AGE BADGE INSTEAD OF EST CARD */}
            <div className="h-24 bg-white rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center shadow-sm">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</span>
               <span className="text-2xl font-black text-slate-900">{/* Age Logic */}-</span>
            </div>
          </div>
        </div>

        {/* PRIMARY IDENTITY */}
        <div className="mt-10 mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[0.9]">
            {person.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-full shadow-sm">
              <Calendar size={14} className="text-emerald-500" />
              <span className="text-xs font-bold text-slate-600">{person.dob}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-full shadow-sm">
              <Clock size={14} className="text-emerald-500" />
              <span className="text-xs font-bold text-slate-600">{person.time || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-full shadow-sm">
              <MapPin size={14} className="text-emerald-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{person.place}</span>
            </div>
          </div>
        </div>

        {/* ROOTS & PROFESSIONAL CARD (DARK THEME) */}
        <div className="bg-slate-900 rounded-[3.5rem] p-10 md:p-14 text-white shadow-2xl shadow-slate-300 relative overflow-hidden">
          <Sparkles className="absolute top-10 right-10 text-emerald-500/20" size={80} />
          
          <div className="relative z-10 space-y-12">
            {/* ROOTS SECTION */}
            <div className="space-y-10">
              <div className="flex items-center gap-2 text-emerald-500">
                <Heart size={18} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Family Roots</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Father's Name</p>
                  <p className="text-3xl font-bold tracking-tight border-l-2 border-emerald-500 pl-4">
                    {person.father_name || "—"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Mother's Name</p>
                  <p className="text-3xl font-bold tracking-tight border-l-2 border-emerald-500 pl-4">
                    {person.mother_name || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* PROFESSIONAL SECTION - INTEGRATED BELOW ROOTS */}
            <div className="pt-10 border-t border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-emerald-500">
                <Briefcase size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Profession & Business</span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white leading-tight">
                  {person.occupation}
                </p>
                <p className="text-xl font-medium text-emerald-400 italic">
                  {person.business || "Independent Practice"}
                </p>
              </div>
            </div>

            {/* CONTACT SECTION */}
            <div className="pt-10 border-t border-white/10">
              <a 
                href={`tel:${person.contact_number}`}
                className="inline-flex items-center gap-4 bg-emerald-500 hover:bg-emerald-400 transition-colors px-8 py-4 rounded-3xl"
              >
                <Phone size={24} fill="white" />
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-900">Direct Contact</p>
                  <p className="text-xl font-black text-white">{person.contact_number}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
