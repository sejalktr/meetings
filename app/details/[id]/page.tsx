"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Phone, Briefcase, User, GraduationCap, ArrowLeft, Calendar, Clock } from 'lucide-react';

export default function DetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPerson() {
      const { data } = await supabase.from('entries').select('*').eq('id', id).single();
      if (data) setPerson(data);
      setLoading(false);
    }
    if (id) loadPerson();
  }, [id]);

  if (loading) return <div className="text-center mt-20 font-bold text-slate-400">Opening Profile...</div>;
  if (!person) return <div className="text-center mt-20">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* STICKY HEADER */}
      <div className="p-4 flex items-center gap-4 border-b sticky top-0 bg-white/80 backdrop-blur-md z-20">
        <button onClick={() => router.push('/')} className="p-2 bg-slate-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-black text-slate-800 uppercase tracking-tight">Profile Detail</h1>
      </div>

      {/* HERO IMAGE SECTION */}
      <div className="relative h-64 bg-indigo-600 flex items-end justify-center">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <img 
          src={person.photo_1}  /* src={person.photo_1 || 'https://via.placeholder.com/400'} *?
          className="w-40 h-40 rounded-[2.5rem] object-cover border-8 border-white shadow-2xl translate-y-12 z-10"
          alt={person.name}
          // alt="Profile"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Image'; }}
          referrerPolicy="no-referrer" 
        />
      </div>

      {/* CONTENT */}
      <div className="max-w-xl mx-auto mt-16 px-6 text-center">
        <h2 className="text-3xl font-black text-slate-800">{person.name}</h2>
        <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mt-1">{person.occupation}</p>

        <div className="mt-10 grid grid-cols-1 gap-6 text-left">
          <InfoCard icon={<MapPin className="text-red-400"/>} title="Location" value={person.place} />
          
          <div className="grid grid-cols-2 gap-4">
            <InfoCard icon={<Calendar className="text-blue-400"/>} title="Birth Date" value={person.dob} />
            <InfoCard icon={<Clock className="text-orange-400"/>} title="Birth Time" value={person.time} />
          </div>

          <InfoCard icon={<GraduationCap className="text-purple-400"/>} title="Education" value={person.education} />
          <InfoCard icon={<Briefcase className="text-emerald-400"/>} title="Business" value={person.business} />
          
          <div className="p-6 bg-slate-50 rounded-[2rem] space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase">Family Details</p>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 text-sm">Father</span>
              <span className="font-bold text-slate-800">{person.father_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Mother</span>
              <span className="font-bold text-slate-800">{person.mother_name}</span>
            </div>
          </div>

          <a href={`tel:${person.contact_number}`} className="flex items-center justify-center gap-3 w-full py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl">
            <Phone size={20} /> Contact Now
          </a>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, value }: any) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-white">
      <div className="mt-1">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">{title}</p>
        <p className="text-slate-700 font-bold">{value || 'Not Provided'}</p>
      </div>
    </div>
  );
}
