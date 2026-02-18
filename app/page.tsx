"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, MapPin, Plus, UserCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function ListingPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const calculateAge = (dobString: string) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age--;
    return age > 0 ? age : 0;
  };

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('entries').select('*').order('created_at', { ascending: false });
      if (data) setEntries(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtered = entries.filter(item => {
    const age = calculateAge(item.dob).toString();
    const searchTerm = search.toLowerCase();
    return item.name.toLowerCase().includes(searchTerm) || item.place.toLowerCase().includes(searchTerm) || age.includes(searchTerm);
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900">
      {/* MINIMALIST NAV */}
      <nav className="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center rotate-3">
              <Sparkles size={20} className="text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Directory<span className="text-emerald-500">.</span></h1>
          </div>
          <a href="/add" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-100 flex items-center gap-2">
            <Plus size={18} /> Join Now
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* CLEAN HERO */}
        <div className="mb-12">
          <h2 className="text-5xl font-extrabold tracking-tighter text-slate-900 mb-4">Community <br/>Connections</h2>
          <p className="text-slate-500 text-lg max-w-md leading-relaxed">A minimal space to find and connect with members of our local network.</p>
        </div>

        {/* MODERN SEARCH BAR */}
        <div className="relative group mb-16">
          <div className="relative flex items-center bg-white rounded-2xl border border-slate-200 shadow-sm focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all">
            <Search className="ml-5 text-slate-400" size={20} />
            <input 
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, city, or age..." 
              className="w-full px-5 py-6 text-slate-700 outline-none font-medium bg-transparent"
            />
          </div>
        </div>

        {/* LISTING */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
             [1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl"></div>)
          ) : filtered.map((item) => (
            <div 
              key={item.id} 
              onClick={() => window.location.href = `/details/${item.id}`}
              className="group bg-white p-4 rounded-3xl border border-slate-100 hover:border-emerald-200 flex items-center gap-6 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5"
            >
              <img 
                src={item.photo_1} 
                className="w-20 h-20 rounded-2xl object-cover bg-slate-50 grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" 
                alt="" 
              />
              
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                  <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {calculateAge(item.dob)} yrs
                  </span>
                </div>
                <p className="text-slate-400 text-sm font-medium mt-0.5">{item.occupation}</p>
                
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <MapPin size={12} className="text-emerald-500" /> {item.place}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-full bg-slate-50 text-slate-300 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <ArrowRight size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
