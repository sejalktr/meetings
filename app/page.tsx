"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, MapPin, Plus, UserCircle } from 'lucide-react';

export default function ListingPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Helper function to calculate age
  const calculateAge = (dobString: string) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
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
    return (
      item.name.toLowerCase().includes(searchTerm) ||
      item.place.toLowerCase().includes(searchTerm) ||
      age.includes(searchTerm) // Allows searching by age number
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black text-indigo-600 tracking-tighter">COMMUNITY</h1>
          <a href="/add" className="bg-indigo-600 text-white px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all">
            <Plus size={18} /> Join Directory
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, city, or age..." 
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-lg focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <p className="text-slate-400 font-medium">Loading directory...</p>
          ) : filtered.map((item) => {
            const currentAge = calculateAge(item.dob);
            return (
              <div 
                key={item.id} 
                onClick={() => window.location.href = `/details/${item.id}`}
                className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-5 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
              >
                <img src={item.photo_1} className="w-20 h-20 rounded-3xl object-cover bg-slate-100 shadow-inner" alt="" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 leading-tight">{item.name}</h3>
                  <p className="text-indigo-600 text-xs font-bold uppercase tracking-wider mt-1">{item.occupation}</p>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium bg-slate-50 px-2 py-1 rounded-lg">
                      <MapPin size={12} /> {item.place}
                    </div>
                    <div className="flex items-center gap-1 text-indigo-500 text-[11px] font-bold bg-indigo-50 px-2 py-1 rounded-lg">
                      <UserCircle size={12} /> Age: {currentAge}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
