"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, MapPin, Plus, ArrowRight, Sparkles } from 'lucide-react';

export default function ListingPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('entries').select('*').sort(); //order('created_at', { ascending: false });
      if (data) setEntries(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtered = entries.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.place.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans">
      {/* HEADER */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-emerald-500 p-2 rounded-xl group-hover:rotate-12 transition-transform">
               <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter">NETWORK<span className="text-emerald-500">.</span></span>
          </div>
          <a href="/add" className="bg-slate-900 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-slate-200">
            <Plus size={18} /> Join Now
          </a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* HERO */}
        <div className="max-w-2xl mb-12">
          <h2 className="text-5xl font-extrabold tracking-tight mb-4 text-slate-900">
            Discover our <br/>
            <span className="text-emerald-500">growing</span> community.
          </h2>
          <div className="relative mt-8 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, city or age ..." 
              className="w-full pl-12 pr-4 py-5 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-medium"
            />
          </div>
        </div>

        {/* LISTING GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-[2rem]"></div>)
          ) : (
            filtered.map((item) => (
              <div 
                key={item.id} 
                onClick={() => window.location.href = `/details/${item.id}`}
                className="group bg-white p-5 rounded-[2.5rem] border border-slate-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img src={item.photo_1} className="w-20 h-20 rounded-2xl object-cover shadow-inner grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" alt="" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                       <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">{item.name}</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">{item.occupation}</p>
                    <div className="flex items-center gap-1.5 mt-3 text-slate-500">
                      <MapPin size={14} className="text-emerald-500" />
                      <span className="text-xs font-semibold">{item.place}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter group-hover:text-emerald-500 transition-colors">View Profile</span>
                   <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
