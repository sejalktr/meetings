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

  // --- AGE CALCULATION ---
  const calculateAge = (dobString: string) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age > 0 ? age : 0;
  };

  // --- DOWNLOAD LOGIC ---
  const handleDownload = async () => {
    if (!downloadRef.current) return;
    setIsDownloading(true);

    // Ensure we start from the top for the snapshot
    window.scrollTo(0, 0);

    try {
      const element = downloadRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FAFBFF",
        scrollY: -window.scrollY,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('pdf-content');
          if (el) el.style.height = 'auto';
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add extra pages if content is long
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${person.name}_Biodata.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
    } finally {
      setIsDownloading(false);
    }
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-emerald-500" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFBFF] pb-24 text-slate-900">
      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button onClick={() => router.push('/')} className="p-3 bg-slate-50 rounded-2xl">
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={handleDownload} 
              disabled={isDownloading}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl disabled:opacity-50"
            >
              {isDownloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">
                {isDownloading ? "Generating..." : "Download PDF"}
              </span>
            </button>
            <button onClick={handleShare} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. CAPTURE AREA */}
      <main ref={downloadRef} id="pdf-content" className="max-w-3xl mx-auto px-6 pt-8 bg-[#FAFBFF]">
        
        {/* IMAGES */}
        <div className="grid grid-cols-2 gap-4 h-[280px] md:h-[400px]">
          <ImageFrame src={person.photo_1} alt="Primary" />
          <ImageFrame src={person.photo_2} alt="Secondary" />
        </div>

        {/* IDENTITY */}
        <div className="mt-10 space-y-4">
          <h1 className="text-5xl font-black tracking-tighter leading-tight">{person.name}</h1>
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-emerald-600 font-black text-[11px] uppercase tracking-widest">
              <Briefcase size={14} /> {person.occupation}
            </p>
            <p className="flex items-center gap-2 text-slate-400 font-black text-[11px] uppercase tracking-widest">
              <UserCircle2 size={14} /> Gotra: <span className="text-slate-900">{person.gotra || "—"}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-4">
            <MetaBox icon={<Calendar size={16}/>} label="DOB" value={person.dob} />
            <MetaBox icon={<Clock size={16}/>} label="Time" value={person.time} />
            <MetaBox icon={<MapPin size={16}/>} label="Place" value={person.place} />
            <MetaBox icon={<GraduationCap size={16}/>} label="Edu" value={person.education} />
            <MetaBox icon={<Sparkles size={16}/>} label="Age" value={`${calculateAge(person.dob)}y`} />
          </div>
        </div>

        {/* BIO */}
        {person.bio && (
          <div className="mt-12 p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm italic text-slate-600 leading-relaxed">
            "{person.bio}"
            {person.hobbies && (
              <p className="mt-4 not-italic text-[11px] font-bold text-slate-400 capitalize">
                <span className="text-emerald-500 mr-2 uppercase tracking-tighter">Interests:</span> 
                {person.hobbies.toLowerCase()}
              </p>
            )}
          </div>
        )}

        {/* 3. FAMILY & CONTACT CARD */}
        <div className="mt-8 bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-8 py-4 border-b border-slate-100">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Heart size={14} className="text-red-400" fill="currentColor" /> Family & Contact Info
            </h3>
          </div>
          <div className="p-8 space-y-6">
            <FamilyItem label="Father's Name" value={person.father_name} />
            <FamilyItem label="Mother's Name" value={person.mother_name} />
            <FamilyItem label="Family Business" value={person.business} />
            <div className="pt-6 border-t border-slate-50 space-y-4">
              <ContactItem label="Primary Contact" value={person.contact_number} isMain />
              {person.family_contact_1 && <ContactItem label="Family Contact 1" value={person.family_contact_1} />}
              {person.family_contact_2 && <ContactItem label="Family Contact 2" value={person.family_contact_2} />}
            </div>
          </div>
        </div>

        {/* BOTTOM SPACER */}
        <div className="h-24 w-full" />
      </main>
    </div>
  );
}

// --- INTERNAL COMPONENTS ---

function FamilyItem({ label, value }: any) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value || "—"}</p>
    </div>
  );
}

function ContactItem({ label, value, isMain }: any) {
  return (
    <div className={`flex justify-between items-center p-4 rounded-2xl ${isMain ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
        <p className="font-bold">{value}</p>
      </div>
      <Phone size={16} className={isMain ? 'text-emerald-400' : 'text-slate-300'} />
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
      <p className="text-[12px] font-bold text-slate-900">{value || 'N/A'}</p>
    </div>
  );
}
