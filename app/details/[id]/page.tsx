"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Phone, Briefcase, User, GraduationCap, ArrowLeft, Calendar, Clock, Heart } from 'lucide-react';

export default function DetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Age calculation helper
  const calculateAge = (dob: string) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : 0;
  };

  useEffect(() => {
    async function loadPerson() {
      if (!id) return;
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) setPerson(data);
      setLoading(false);
    }
    loadPerson();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!person) return (
    <div className="text-center mt-20 p-10">
      <h2 className="text-2xl font-bold text-slate-800">Profile not found</h2>
      <button onClick={() => router.push('/')} className="mt-4 text-indigo-600 font-bold underline">Back to Directory</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* STICKY HEADER */}
      <div className="p-4 flex items-center justify-between border-b sticky top-0 bg-white/90 backdrop-blur-md z-30">
        <button onClick={() => router.push('/')} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-all">
          <ArrowLeft size={20} />
        </button>
        <span className="font-black text-slate-800 tracking-tighter uppercase text-sm">Profile Details</span>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </div>

      {/* HERO SECTION WITH IMAGE */}
      <div className="relative h-56 bg-gradient-to-br from-indigo-600 to-violet-700 flex items-end justify-center">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative translate-y-16">
          <img 
            src={person.photo_1 || 'https://via.placeholder.com/400?text=No+Photo'} 
            className="w-44 h-44 rounded-[3rem] object-cover border-8 border-white shadow-2xl"
            alt={person.name}
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Image+Error'; }}
          />
        </div>
      </div>

      {/* BASIC INFO */}
      <div className="max-w-xl mx-auto mt-20 px-6 text-center">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{person.name}</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">{person.occupation}</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span className="text-slate-500 font-medium text-xs">{person.place}</span>
        </div>

        {/* DETAILS GRID */}
        <div className="mt-10 grid grid-cols-1 gap-4 text-left">
          
          <div className="grid grid-cols-3 gap-4">
             <DetailBox label="DOB" value={person.dob} icon={<Calendar size={18} className="text-blue-500" />} />
             <DetailCard icon={<Calendar size={18} className="text-blue-500"/>} title="Age" value={`${calculateAge(person.dob)} Years`} />
             <DetailCard icon={<Clock size={18} className="text-amber-500"/>} title="Birth Time" value={person.time} />
          </div>
          

          <DetailCard icon={<MapPin size={18} className="text-rose-500"/>} title="Place of Birth" value={person.place} />
          <DetailCard icon={<GraduationCap size={18} className="text-purple-500"/>} title="Education" value={person.education} />
          
          
          {/* FAMILY SECTION */}
          <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 mt-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Heart size={12} fill="currentColor"/> Family Details
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                <span className="text-slate-500 text-sm font-medium">Father's Name</span>
                <span className="font-bold text-slate-800">{person.father_name || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm font-medium">Mother's Name</span>
                <span className="font-bold text-slate-800">{person.mother_name || '—'}</span>
              </div>
            </div>
            <DetailCard icon={<Briefcase size={18} className="text-emerald-500"/>} title="Business" value={person.business} />
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="fixed bottom-6 left-0 right-0 px-6 z-40 max-w-xl mx-auto">
          <a 
            href={`tel:${person.contact_number}`} 
            className="flex items-center justify-center gap-3 w-full py-5 bg-slate-900 text-white rounded-[2rem] font-bold shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Phone size={20} /> Contact Now
          </a>
        </div>
      </div>
    </div>
  );
}

// Reusable Detail Card Component
function DetailCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-3xl border border-slate-100 bg-white shadow-sm hover:border-indigo-100 transition-colors">
      <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">{title}</p>
        <p className="text-slate-700 font-bold text-sm">{value || 'Not Provided'}</p>
      </div>
    </div>
  );
}
