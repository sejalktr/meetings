"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, Phone, Briefcase, ArrowLeft, Calendar, 
  Clock, Heart, Sparkles, Loader2, Share2, UserCircle2
} from 'lucide-react';

export default function DetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- AGE CALCULATION LOGIC ---
  const calculateAge = (dobString: string) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age > 0 ? age : 0;
  };

  // --- SHARE FUNCTIONALITY ---
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${person.name} | Network Directory`,
          text: `Check out ${person.name}'s profile on our community network.`,
          url: window.location.href,
        });
      } catch (err) { console.log('Error sharing', err); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('entries').select('*').eq('id', id).single();
      if (data) setPerson(data);
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#FAFBFF] pb-24 text-slate-900">
      {/* 1. UPDATED NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button onClick={() => router.push('/')} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-black text-[11px] tracking-[0.3em] uppercase text-slate-800">Verified Profile</span>
          </div>
          <button onClick={handleShare} className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-2xl transition-all group">
            <Share2 size={20} className="text-emerald-600 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-6">
        {/* 2. SECTION 1: TWO IMAGES (Side by Side) */}
        <div className="grid grid-cols-2 gap-4 h-[260px] md:h-[400px]">
          <ImageFrame src={person.photo_1} alt="Primary" />
          <ImageFrame src={person.photo_2} alt="Secondary" />
        </div>

        {/* 3. SECTION 2: IDENTITY & METADATA */}
        <div className="mt-10 space-y-8">
          <div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 leading-[0.9]">
              {person.name}
            </h1>
            <p className="mt-4 text-emerald-600 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
              <Briefcase size={14} /> {person.occupation}
            </p>
          </div>

          {/* META GRID */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3"> {/* Increased grid to 5 for desktop */}
            <MetaBox icon={<Calendar size={18}/>} label="Birth Date" value={person.dob} />
            <MetaBox icon={<Clock size={18}/>} label="Time" value={person.time || "--:--"} />
            <MetaBox icon={<MapPin size={18}/>} label="Birth Place" value={person.place} />
            <MetaBox icon={<GraduationCap size={18}/>} label="Education" value={person.education || "N/A"} />
            <MetaBox icon={<Sparkles size={18}/>} label="Age" value={`${calculateAge(person.dob)} Years`} />
          </div>
        </div>

        {/* 4. SECTION 3: FAMILY ROOTS (LIGHT THEME) */}
        <div className="mt-12 bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
              <Heart size={20} fill="currentColor" />
            </div>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Legacy & Roots</h3>
          </div>

          <div className="space-y-10">
            {/* Father */}
            <div className="group">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Father's Name</p>
              <p className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">
                {person.father_name || "—"}
              </p>
            </div>

            {/* Mother */}
            <div className="group">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Mother's Name</p>
              <p className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">
                {person.mother_name || "—"}
              </p>
            </div>

            {/* Business - MOVED HERE */}
            <div className="pt-10 border-t border-slate-50">
              <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                <Briefcase size={14} /> Family Business / Enterprise
              </p>
              <p className="text-2xl font-black text-slate-900 leading-tight">
                {person.business || "General Enterprise"}
              </p>
            </div>

            {/* Contact */}
            <div className="pt-6">
              <a href={`tel:${person.contact_number}`} className="flex items-center gap-4 p-4 bg-slate-900 rounded-[2rem] text-white hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Phone size={24} fill="currentColor" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Mobile Number</p>
                  <p className="text-xl font-bold">{person.contact_number}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- REUSABLE UI COMPONENTS ---

function ImageFrame({ src, alt }: { src: string, alt: string }) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-100 shadow-xl border-4 border-white">
      {src ? (
        <img src={src} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" alt={alt} />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
          <UserCircle2 size={60} strokeWidth={1} />
          <span className="text-[10px] font-bold uppercase mt-2">No {alt} Photo</span>
        </div>
      )}
    </div>
  );
}

function MetaBox({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-emerald-200 transition-all">
      <div className="text-emerald-500 mb-3 group-hover:scale-110 transition-transform">{icon}</div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">{label}</p>
      <p className="text-[13px] font-bold text-slate-900">{value}</p>
    </div>
  );
}
