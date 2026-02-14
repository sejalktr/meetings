"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, MapPin, Briefcase, GraduationCap, Plus } from 'lucide-react';

export default function ListingPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('entries').select('*').order('created_at', { ascending: false });
      if (data) {
        setEntries(data);
        setFiltered(data);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const results = entries.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.place.toLowerCase().includes(search.toLowerCase()) ||
      item.occupation.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(results);
  }, [search, entries]);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* TOP NAVIGATION */}
      <nav className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Community
          </h1>
          <a href="/add" className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            <Plus size={18} /> Join Now
          </a>
        </div>
      </nav>

      {/* SEARCH SECTION */}
      <div className="max-w-6xl mx-auto pt-10 px-4">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, city, or profession..." 
            className="w-full pl-12 pr-4 py-4 rounded-3xl border-none shadow-xl focus:ring-2 focus:ring-indigo-400 text-lg"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="max-w-6xl mx-auto mt-12 px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <p className="col-span-full text-center text-slate-500 font-medium">Loading directory...</p>
        ) : filtered.map((item) => (
          <div key={item.id} className="group bg-white rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col items-center text-center">
            <div className="relative w-32 h-32 mb-6">
              <div className="absolute inset-0 bg-indigo-100 rounded-[2rem] rotate-6 group-hover:rotate-12 transition-transform"></div>
              <img 
                src={item.photo_1 || 'https://via.placeholder.com/150'} 
                alt={item.name} 
                className="relative w-32 h-32 rounded-[2rem] object-cover border-4 border-white shadow-md"
              />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-1">{item.name}</h2>
            <p className="text-indigo-600 font-bold text-sm uppercase tracking-wider mb-4">{item.occupation}</p>
            
            <div className="w-full pt-4 border-t border-slate-50 space-y-2">
              <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                <MapPin size={14} className="text-slate-400" /> {item.place}
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                <GraduationCap size={14} className="text-slate-400" /> {item.education}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
