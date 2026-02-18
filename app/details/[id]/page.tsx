"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, Phone, Briefcase, User, GraduationCap, 
  ArrowLeft, Calendar, Clock, Heart, UserCircle, Sparkles 
} from 'lucide-react';

export default function DetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const calculateAge = (dob: string) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age > 0 ? age : 0;
  };

  useEffect(() => {
    async function loadPerson() {
      if (!id) return;
      const { data } = await supabase.from('entries').select('*').eq('id', id).single();
      if (data) setPerson(data);
      setLoading(false);
    }
    loadPerson();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500"></div>
    </div>
  );

  if (!person) return <div className="text-center mt-20 font-bold">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-32">
      {/* NAVIGATION */}
      <nav className="p-4 sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft size={22} className="text-slate-600" />
          </button>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Profile Intelligence</span>
          <div className="w-10"></div>
        </div>
      </nav>

      {/* BENTO PHOTO GALLERY */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-12 gap-4 h-[350px] md:h-[500px]">
          {/* Main Photo (Large) */}
          <div className="col-span-8 relative group overflow-hidden rounded-[2.5rem] shadow-2xl shadow-slate-200">
            <img 
              src={person.photo_1} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              alt="Primary"
            />
            <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] text-white font-bold uppercase tracking-widest border border-white/30">
              Primary View
            </div>
          </div>
          
          {/* Side Column */}
          <div className="col-span-4 flex flex-col gap-4">
            {/* Secondary Photo */}
            <div className="h-3/5 overflow-hidden rounded-[2.5rem] shadow-xl shadow-slate-200 group">
              <img 
                src={person.photo_2 || person.photo_1} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt="Secondary"
              />
            </div>
            {/* Emerald Stat Card */}
            <div className="h-2/5 bg-emerald-500 rounded-[2.5rem] flex flex-col items-center justify-center text-white p-4 shadow-lg shadow-emerald-200">
              <Sparkles size={24} className="mb-2 opacity-40" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Verified Member</p>
              <p className="text-2xl font-black italic tracking-tighter">Est. 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* TEXT CONTENT */}
      <div className="max-w-2xl mx-auto px-6 mt-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">{person.name}</h1>
          <div className="flex items-center justify-center gap-3">
            <span className="text-emerald-600 font-bold text-sm uppercase tracking-widest">{person.occupation}</span>
            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
            <span className="text-slate-400 font-medium text-sm">{person.place}</span>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-3 gap-3">
            <StatBox icon={<Calendar size={18} className="text-emerald-500"/>} label="DOB" value={person.dob} />
            <StatBox icon={<UserCircle size={18} className="text-emerald-500"/>} label="Age" value={`${calculateAge(person.dob)} Yrs`} />
            <StatBox icon={<Clock size={18} className="text-emerald-500"/>} label="Time" value={person.time} />
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 mt-4">
            <DetailItem icon={<MapPin size={20} />} label="Birth Place" value={person.place} />
            <DetailItem icon={<GraduationCap size={20} />} label="Education" value={person.education} />
            <DetailItem icon={<Briefcase size={20} />} label="Professional Life" value={person.business || person.occupation} />
          </div>

          {/* FAMILY SECTION */}
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white mt-4 shadow-2xl shadow-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Heart size={100} fill="currentColor" />
            </div>
            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              Family Roots
            </h4>
            <div className="grid grid-cols-2 gap-8 relative z-10">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Father</p>
                <p className="text-lg font-bold">{person.father_name || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Mother</p>
                <p className="text-lg font-bold">{person.mother_name || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CALL ACTION */}
        <div className="fixed bottom-8 left-0 right-0 px-6 z-50">
          <a 
            href={`tel:${person.contact_number}`} 
            className="max-w-md mx-auto flex items-center justify-center gap-3 w-full py-6 bg-emerald-500 text-white rounded-3xl font-black text-lg shadow-2xl shadow-emerald-200 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Phone size={24} fill="currentColor" /> CONTACT NOW
          </a>
        </div>
      </div>
    </div>
  );
}

// Minimal Components
function StatBox({ icon, label, value }: any) {
  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-100 text-center shadow-sm">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">{label}</p>
      <p className="text-slate-800 font-bold text-xs truncate">{value || 'N/A'}</p>
    </div>
  );
}

function DetailItem({ icon, label, value }: any) {
  return (
    <div className="flex items-start gap-5">
      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-slate-700 font-bold text-lg leading-tight">{value || 'Not provided'}</p>
      </div>
    </div>
  );
}
