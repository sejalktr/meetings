"use client";
import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, Briefcase, MapPin, Heart, Camera, Check, Loader2, Copy, ExternalLink, Share2, PartyPopper } from 'lucide-react';

export default function AddProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [createdData, setCreatedData] = useState<{ token: string } | null>(null);
  const [photos, setPhotos] = useState<{ p1: File | null, p2: File | null }>({ p1: null, p2: null });

  const editLink = createdData ? `${window.location.origin}/edit/${createdData.token}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editLink);
    alert("Link copied to clipboard!");
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Validations
    const required = ['name', 'dob', 'place', 'education', 'occupation', 'contact_number'];
    for (const field of required) {
      if (!formData.get(field)) {
        alert(`Please fill in the required field: ${field.replace('_', ' ')}`);
        return;
      }
    }

    // Must have at least one parent name
    if (!formData.get('father_name') && !formData.get('mother_name')) {
      alert("Please provide a parent name.");
      return;
    }
    
    setLoading(true);

    try {
      // 2. UNIQUE CONTACT & DUPLICATE CHECK
      const { data: existing, error: checkError } = await supabase
        .from('entries')
        .select('name, dob, father_name, mother_name, contact_number')
        .or(`contact_number.eq.${formData.get('contact_number')}, name.eq.${formData.get('name')}`);

      if (checkError) throw checkError;
      
      if (existing && existing.length > 0) {
        const isExactMatch = existing.find(ex => 
          ex.contact_number === formData.get('contact_number') || 
          (ex.name === formData.get('name') && 
           ex.dob === formData.get('dob') && 
           (ex.father_name === formData.get('father_name') || ex.mother_name === formData.get('mother_name')))
        );

        if (isExactMatch) {
          alert("A profile with these details or this contact number already exists.");
          setLoading(false);
          return;
        }
      }
      
      const token = crypto.randomUUID();
      let urls = { p1: '', p2: '' };

      for (const key of ['p1', 'p2'] as const) {
        const file = photos[key];
        if (file) {
          const path = `profile-photos/${token}-${key}-${Date.now()}`;
          const { error: upErr } = await supabase.storage.from('user-photos').upload(path, file);
          if (upErr) throw upErr;
          urls[key] = supabase.storage.from('user-photos').getPublicUrl(path).data.publicUrl;
        }
      }

      const { error: insErr } = await supabase.from('entries').insert([{
        name: formData.get('name'),
        dob: formData.get('dob'),
        time: formData.get('time'),
        place: formData.get('place'),
        education: formData.get('education'),
        occupation: formData.get('occupation'),
        gotra: formData.get('gotra'),
        hobbies: formData.get('hobbies'),
        bio: formData.get('bio'),
        father_name: formData.get('father_name'),
        mother_name: formData.get('mother_name'),
        business: formData.get('business'),
        contact_number: formData.get('contact_number'),
        family_contact_1: formData.get('family_contact_1'),
        family_contact_2: formData.get('family_contact_2'),
        photo_1: urls.p1,
        photo_2: urls.p2,
        edit_token: token
      }]);

      if (insErr) throw insErr;
      setCreatedData({ token });
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  // SUCCESS SCREEN
  if (createdData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-slate-100 text-center space-y-8 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <PartyPopper size={40} />
          </div>
          
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Profile Created!</h2>
            <p className="text-slate-500 text-sm mt-2">Keep this link safe to edit your profile in the future.</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 break-all text-xs font-bold text-indigo-600">
            {editLink}
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button onClick={copyToClipboard} className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase text-xs hover:bg-slate-800 transition-all">
              <Copy size={16} /> Copy Edit Link
            </button>
            <a href={editLink} target="_blank" className="flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase text-xs hover:bg-indigo-500 transition-all text-center">
              <ExternalLink size={16} /> Open Edit Mode
            </a>
            <button onClick={() => router.push('/')} className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold uppercase text-xs hover:bg-slate-200 transition-all">
              Go to Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <div className="bg-white border-b p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">New Registration</h1>
          <button onClick={() => router.push('/')} className="text-[10px] font-black uppercase text-slate-400">Cancel</button>
        </div>
      </div>

      <div className="max-w-xl mx-auto mt-8 px-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* PHOTO SELECTION */}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map(num => (
              <div key={num} className="bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-100 aspect-square flex flex-col items-center justify-center overflow-hidden relative group">
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setPhotos(prev => ({...prev, [`p${num}`]: e.target.files?.[0] || null}))} />
                {photos[`p${num}` as 'p1' | 'p2'] ? (
                  <img src={URL.createObjectURL(photos[`p${num}` as 'p1' | 'p2']!)} className="w-full h-full object-cover rounded-[2rem]" />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center gap-2 group-hover:text-indigo-500 transition-colors">
                    <Camera size={24} />
                    <span className="text-[10px] font-bold uppercase">Add Photo {num}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* PERSONAL SECTION */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-5">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Personal Info</h3>
            <InputField label="Full Name *" name="name" icon={<User size={16}/>} />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Date of Birth *" name="dob" type="date" />
              <InputField label="Time of Birth" name="time" type="time" />
            </div>
            <InputField label="Birth Place *" name="place" icon={<MapPin size={16}/>} />
            <InputField label="Gotra" name="gotra" />
            <InputField label="Education *" name="education" />
            <InputField label="Occupation *" name="occupation" icon={<Briefcase size={16}/>} />
            <InputField label="Hobbies" name="hobbies" />
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 ml-5 uppercase">Describe Yourself</label>
              <textarea name="bio" rows={3} className="w-full px-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-700 font-bold text-sm outline-none" placeholder="Write a few lines about yourself..." />
            </div>
          </div>

          {/* FAMILY SECTION */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-5">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Family & Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Father's Name" name="father_name" icon={<Heart size={14}/>} />
              <InputField label="Mother's Name" name="mother_name" icon={<Heart size={14}/>} />
            </div>
            <InputField label="Business Name" name="business" />
            <InputField label="Primary Contact *" name="contact_number" type="tel" />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Family Contact 1" name="family_contact_1" />
              <InputField label="Family Contact 2" name="family_contact_2" />
            </div>
          </div>

          <button disabled={loading} className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-tight shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" /> : <Check size={20} />}
            {loading ? "Creating Profile..." : "Submit Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, name, type = "text", icon }: any) {
  return (
    <div className="space-y-1 w-full text-left font-sans">
      <label className="text-[10px] font-bold text-slate-400 ml-5 uppercase tracking-tighter">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
        <input name={name} type={type} className={`w-full ${icon ? 'pl-12' : 'pl-5'} pr-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-700 font-bold text-sm outline-none transition-all`} />
      </div>
    </div>
  );
}
