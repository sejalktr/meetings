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
    <div className="min-h-screen bg-[#FAFBFF] pb-32 text-slate-900">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button onClick={() => router.push('/')} className="p-3 bg-slate-50 rounded-2xl">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <button onClick={handleDownload} disabled={isDownloading} className="p-3 bg-slate-900 text-white rounded-2xl flex items-center gap-2 px-6 shadow-xl active:scale-95 transition-all">
            {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </span>
          </button>
        </div>
      </nav>

      {/* THE CAPTURE AREA */}
      <main ref={downloadRef} className="max-w-3xl mx-auto px-6 pt-6 bg-[#FAFBFF]">
        
        {/* 1. IMAGES */}
        <div className="grid grid-cols-2 gap-4 h-[260px] md:h-[400px]">
          <ImageFrame src={person.photo_1} alt="Primary" />
          <ImageFrame src={person.photo_2} alt="Secondary" />
        </div>

        {/* 2. IDENTITY (NO CARDS - CLEAN TEXT) */}
        <div className="mt-10 space-y-6">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 leading-[0.9]">
            {person.name}
          </h1>
          
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <Briefcase size={18} className="text-emerald-500" />
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                Occupation: <span className="text-slate-900 ml-2">{person.occupation}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <UserCircle2 size={18} className="text-emerald-500" />
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                Gotra: <span className="text-slate-900 ml-2">{person.gotra || "—"}</span>
              </p>
            </div>
          </div>

          {/* BIRTH META GRID */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-6">
            <MetaBox icon={<Calendar size={18}/>} label="Birth Date" value={person.dob} />
            <MetaBox icon={<Clock size={18}/>} label="Time" value={person.time || "--:--"} />
            <MetaBox icon={<MapPin size={18}/>} label="Birth Place" value={person.place} />
            <MetaBox icon={<GraduationCap size={18}/>} label="Education" value={person.education} />
            <MetaBox icon={<Sparkles size={18}/>} label="Age" value={`${calculateAge(person.dob)} Years`} />
          </div>
        </div>

        {/* 3. BIO SECTION */}
        {person.bio && (
          <div className="mt-14 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-2">Personal Note</p>
            <div className="p-8 bg-white border-l-4 border-emerald-500 rounded-r-[2rem] shadow-sm">
              <p className="text-slate-700 italic leading-relaxed text-lg">"{person.bio}"</p>
              {person.hobbies && (
                <p className="mt-6 text-[11px] font-bold text-slate-400 capitalize">
                  <span className="text-emerald-600 font-black uppercase tracking-tighter mr-2">Interests:</span>
                  {person.hobbies.toLowerCase()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 4. LINEAR DATA LIST (Clean separate lines) */}
        <div className="mt-14 space-y-10">
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 ml-2">Family Information</h3>
            <div className="space-y-8 ml-2">
              <SimpleRow label="Father's Name" value={person.father_name} />
              <SimpleRow label="Mother's Name" value={person.mother_name} />
              <SimpleRow label="Family Business" value={person.business} />
            </div>
          </section>

          <section className="pt-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 ml-2">Contact Details</h3>
            <div className="space-y-4">
              <ContactStrip label="Primary Mobile" value={person.contact_number} isPrimary />
              {person.family_contact_1 && <ContactStrip label="Family Contact 1" value={person.family_contact_1} />}
              {person.family_contact_2 && <ContactStrip label="Family Contact 2" value={person.family_contact_2} />}
            </div>
          </section>
        </div>

        {/* BOTTOM SPACER FOR PDF CLIPPING */}
        <div className="h-24 w-full" /> 
      </main>
    </div>
  );
}

// --- COMPONENTS ---

function SimpleRow({ label, value }: any) {
  return (
    <div className="group">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">
        {value || "—"}
      </p>
    </div>
  );
}

function ContactStrip({ label, value, isPrimary }: any) {
  return (
    <div className={`w-full p-6 rounded-3xl border transition-all ${
      isPrimary 
      ? 'bg-slate-900 border-slate-800 text-white shadow-2xl shadow-slate-200' 
      : 'bg-white border-slate-100 text-slate-700'
    }`}>
      <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isPrimary ? 'text-emerald-400' : 'text-slate-400'}`}>
        {label}
      </p>
      <p className={`text-xl font-bold ${isPrimary ? 'text-white' : 'text-slate-900'}`}>{value}</p>
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
