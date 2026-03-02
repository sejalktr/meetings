"use client";
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  MapPin, Phone, Briefcase, ArrowLeft, Calendar, 
  Clock, Heart, Sparkles, Loader2, Share2, UserCircle2, 
  GraduationCap, Download, Quote, Trophy
} from 'lucide-react';

export default function DetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const downloadRef = useRef<HTMLDivElement>(null);
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // --- PDF DOWNLOAD LOGIC ---
  const handleDownload = async () => {
    if (!downloadRef.current) return;
    setIsDownloading(true);
    try {
      const element = downloadRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, // High quality
        useCORS: true, // Crucial for Supabase Images
        backgroundColor: "#FAFBFF",
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${person.name}_Biodata.pdf`);
    } catch (err) {
      console.error('Download Error:', err);
      alert("Failed to generate PDF. Check CORS settings.");
    } finally {
      setIsDownloading(false);
    }
  };

  const calculateAge = (dobString: string) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age > 0 ? age : 0;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${person.name} | Biodata`,
          url: window.location.href,
        });
      } catch (err) { console.log(err); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
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
      {/* NAVBAR (remains the same) */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button onClick={() => router.push('/')} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          
          <div className="flex gap-2">
            <button onClick={handleDownload} disabled={isDownloading} className="p-3 bg-slate-900 text-white rounded-2xl transition-all flex items-center gap-2 px-4 shadow-xl">
              {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">
                {isDownloading ? 'Generating...' : 'Download PDF'}
              </span>
            </button>
            <button onClick={handleShare} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl transition-all">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* THE CAPTURE AREA */}
      <main ref={downloadRef} className="max-w-4xl mx-auto px-6 pt-6 bg-[#FAFBFF] pb-20"> {/* Added pb-20 for PDF scroll space */}
        
        {/* IMAGES */}
        <div className="grid grid-cols-2 gap-4 h-[260px] md:h-[400px]">
          <ImageFrame src={person.photo_1} alt="Primary" />
          <ImageFrame src={person.photo_2} alt="Secondary" />
        </div>

        {/* IDENTITY & FULL-WIDTH FIELDS */}
        <div className="mt-10 space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 leading-[0.9] mb-6">
            {person.name}
          </h1>
          
          {/* Full Width Lines for Occupation and Gotra */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <Briefcase size={18} className="text-emerald-500" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Occupation: <span className="text-slate-900 ml-2">{person.occupation}</span></p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <UserCircle2 size={18} className="text-emerald-500" /> {/* Person icon for Gotra */}
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Gotra: <span className="text-slate-900 ml-2">{person.gotra || "—"}</span></p>
            </div>
          </div>

          {/* META GRID (Birth Details) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4">
            <MetaBox icon={<Calendar size={18}/>} label="Birth Date" value={person.dob} />
            <MetaBox icon={<Clock size={18}/>} label="Time" value={person.time || "--:--"} />
            <MetaBox icon={<MapPin size={18}/>} label="Birth Place" value={person.place} />
            <MetaBox icon={<GraduationCap size={18}/>} label="Education" value={person.education} />
            <MetaBox icon={<Sparkles size={18}/>} label="Age" value={`${calculateAge(person.dob)} Years`} />
          </div>
        </div>

        {/* BIO CARD (Refined) */}
        {person.bio && (
          <div className="mt-10 border-t border-slate-100 pt-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-2">Self Description</h3>
            <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm relative">
               <Quote size={24} className="text-slate-100 absolute top-6 right-8" />
               <p className="text-slate-700 leading-relaxed font-medium">
                 {person.bio}
               </p>
               {person.hobbies && (
                 <p className="mt-6 text-sm text-slate-500 border-t border-slate-50 pt-4">
                   <span className="font-black text-[9px] uppercase tracking-widest text-emerald-600 mr-2">Hobbies:</span> 
                   <span className="capitalize">{person.hobbies.toLowerCase()}</span>
                 </p>
               )}
            </div>
          </div>
        )}

        {/* FAMILY & ROOTS */}
        <div className="mt-10 bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Family Side */}
            <div className="space-y-8">
              <div className="flex items-center gap-2 mb-2">
                 <Heart size={16} className="text-red-400" fill="currentColor" />
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Family Roots</h3>
              </div>
              <FamilyRow label="Father" value={person.father_name} />
              <FamilyRow label="Mother" value={person.mother_name} />
              <FamilyRow label="Business" value={person.business} />
            </div>

            {/* Contacts Side (Full width items inside the grid column) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                 <Phone size={16} className="text-indigo-400" />
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Communication</h3>
              </div>
              <ContactRow label="Primary Contact" value={person.contact_number} isMain />
              {person.family_contact_1 && <ContactRow label="Family Contact 1" value={person.family_contact_1} />}
              {person.family_contact_2 && <ContactRow label="Family Contact 2" value={person.family_contact_2} />}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// --- COMPONENTS ---

function FamilyRow({ label, value }: any) {
  return (
    <div className="pb-4 border-b border-slate-50 last:border-0">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value || "—"}</p>
    </div>
  );
}

function ContactRow({ label, value, isMain }: any) {
  return (
    <div className={`w-full p-5 rounded-2xl border transition-all ${
      isMain 
      ? 'bg-slate-900 border-slate-800 text-white shadow-lg' 
      : 'bg-slate-50 border-slate-100 text-slate-700'
    }`}>
      <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isMain ? 'opacity-60' : 'text-slate-400'}`}>
        {label}
      </p>
      <p className={`font-bold ${isMain ? 'text-xl' : 'text-base'}`}>{value}</p>
    </div>
  );
}

function ImageFrame({ src, alt }: { src: string, alt: string }) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-100 shadow-xl border-4 border-white">
      {src ? (
        <img src={src} crossOrigin="anonymous" className="w-full h-full object-cover" alt={alt} />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
          <UserCircle2 size={60} strokeWidth={1} />
        </div>
      )}
    </div>
  );
}


function MetaBox({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
      <div className="text-emerald-500 mb-2">{icon}</div>
      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{label}</p>
      <p className="text-[12px] font-bold text-slate-900">{value}</p>
    </div>
  );
}
