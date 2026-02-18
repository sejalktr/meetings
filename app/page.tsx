"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, MapPin, Plus } from 'lucide-react';

export default function ListingPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const calculateAge = (dobString: string) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age > 0 ? age : 0;
  };

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('entries')
        .select('*')
        .order('name', { ascending: true });
      if (data) setEntries(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtered = entries.filter(item => {
    const searchTerm = search.toLowerCase();
    const age = calculateAge(item.dob).toString();
    return (
      item.name.toLowerCase().includes(searchTerm) || 
      item.place.toLowerCase().includes(searchTerm) || 
      age.includes(searchTerm)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-4 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black text-slate-900 tracking-tighter italic">DIRECTORY<span className="text-emerald-500">.</span></h1>
          <a href="/add" className="bg-slate-900 text-white p-2 rounded-xl">
            <Plus size={20} />
          </a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-3 py-6">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, city, age..." 
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white outline-none focus:border-emerald-500 text-sm font-medium transition-all"
          />
        </div>

        {/* 2-COLUMN GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {loading ? (
             [1,2,3,4].map(i => <div key={i} className="h-48 bg-white animate-pulse rounded-[2rem]"></div>)
          ) : filtered.map((item) => (
            <div 
              key={item.id} 
              onClick={() => window.location.href = `/details/${item.id}`}
              className="bg-white p-2.5 rounded-[2rem] border border-slate-100 shadow-sm active:scale-95 transition-transform cursor-pointer flex flex-col h-full"
            >
              <img 
                src={item.photo_1} 
                className="w-full aspect-square rounded-[1.5rem] object-cover mb-3" 
                alt={item.name} 
              />
              
              <div className="px-1 flex flex-col flex-1 justify-between">
                <div>
                  {/* 2-LINE NAME LOGIC */}
                  <h3 className="font-bold text-slate-900 text-[13px] leading-tight line-clamp-2 min-h-[2rem]">
                    {item.name}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {calculateAge(item.dob)}Y
                    </span>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[60px]">
                      {item.occupation}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-50 flex items-center gap-1 text-slate-400">
                  <MapPin size={10} className="shrink-0 text-emerald-500" />
                  <span className="text-[9px] font-medium truncate italic">{item.place}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
