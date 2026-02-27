  
"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, MapPin, Plus, Sparkles, Calendar, Clock, ArrowRight } from 'lucide-react';

export default function Home() {
  // --- PASTE THE DEBUG CODE HERE ---
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 text-center max-w-sm">
          <h1 className="text-red-500 font-black text-2xl mb-2">Connection Error</h1>
          <p className="text-slate-600 text-sm">
            Vercel is not reading your Supabase keys. Please check your Environment Variables in the Vercel Dashboard.
          </p>
        </div>
      </div>
    );
  }
  // --- END OF DEBUG CODE ---

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
      try {
        const { data, error } = await supabase.from('entries').select('*').order('name', { ascending: true });
        
        if (error) {
          console.error("Supabase Fetch Error:", error.message);
          setLoading(false);
          return;
        }
  
        if (data) setEntries(data);
      } catch (err) {
        console.error("Unexpected Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = entries.filter(item => {
    const searchTerm = search.toLowerCase();
    const age = calculateAge(item.dob).toString();
    return item.name.toLowerCase().includes(searchTerm) || item.place.toLowerCase().includes(searchTerm) || age.includes(searchTerm);
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2 rounded-xl">
               <Sparkles size={18} className="text-emerald-400" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase">NETWORK<span className="text-emerald-500">.</span></span>
          </div>
          <a href="/add" className="bg-slate-900 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-slate-200">
            <Plus size={18} /> Join Now
          </a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* GROWTH HEADER */}
        <div className="mb-10 text-left px-2">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-none">
            Our growing <br/>
            <span className="text-emerald-500">community.</span>
          </h2>
          <p className="mt-3 text-slate-400 font-medium text-sm md:text-base">Connecting community across the region.</p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-8 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, city or age..." 
            className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 bg-white shadow-sm focus:border-emerald-500 outline-none transition-all font-semibold text-sm"
          />
        </div>

        {/* COMPACT HORIZONTAL GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading ? (
             [1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-3xl"></div>)
          ) : filtered.map((item) => (
            <div 
              key={item.id} 
              onClick={() => window.location.href = `/details/${item.id}`}
              className="group bg-white p-3 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all cursor-pointer flex items-center gap-4"
            >
              {/* COMPACT IMAGE */}
              <div className="relative shrink-0">
                <img 
                  src={item.photo_1} 
                  className="w-24 h-24 rounded-2xl object-cover shadow-inner" 
                  alt={item.name} 
                />
                <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-white">
                  {calculateAge(item.dob)}Y
                </div>
              </div>
              
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="font-black text-slate-900 text-[16px] leading-tight line-clamp-2">
                  {item.name}
                </h3>
                
                {/* DOB & TIME IN ONE ROW TO SAVE SPACE */}
                <div className="mt-2 space-y-1 text-slate-400">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={10} className="text-emerald-500" />
                      <span className="text-[10px] font-bold">{item.dob}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={10} className="text-emerald-500" />
                      <span className="text-[10px] font-bold">{item.time || "N/A"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={10} className="text-emerald-500" />
                    <span className="text-[10px] font-bold truncate italic uppercase tracking-tighter">{item.place}</span>
                  </div>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-200 group-hover:text-emerald-500 transition-colors shrink-0" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// ... rest of your existing Home page code (useEffect, return, etc.)
}
