"use client";
import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, User, Briefcase, MapPin, Heart, Camera, Trash2, Loader2, AlertCircle, Check } from 'lucide-react';

export function EditForm({ initialData, token }: { initialData: any, token: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  const [photos, setPhotos] = useState({
    photo_1: initialData.photo_1 || '',
    photo_2: initialData.photo_2 || ''
  });

  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, key: 'photo_1' | 'photo_2') {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(key);
    const fileExt = file.name.split('.').pop();
    const fileName = `${token}-${key}-${Date.now()}.${fileExt}`;
    const filePath = `profile-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('user-photos')
      .upload(filePath, file);

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
    } else {
      const { data } = supabase.storage.from('user-photos').getPublicUrl(filePath);
      setPhotos(prev => ({ ...prev, [key]: data.publicUrl }));
    }
    setUploading(null);
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    
    const updates = {
      name: form.get('name'),
      dob: form.get('dob'),
      time: form.get('time'),
      place: form.get('place'),
      education: form.get('education'),
      occupation: form.get('occupation'),
      business: form.get('business'),
      father_name: form.get('father_name'),
      mother_name: form.get('mother_name'),
      contact_number: form.get('contact_number'),
      photo_1: photos.photo_1,
      photo_2: photos.photo_2,
    };

    const { error } = await supabase.from('entries').update(updates).eq('edit_token', token);

    setSaving(false);
    if (error) {
      alert("Save Error: " + error.message);
    } else {
      alert("Changes saved successfully!");
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans selection:bg-indigo-100">
      <div className="bg-white border-b sticky top-0 z-20 p-4 shadow-sm">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-slate-800 uppercase">Edit Profile</h1>
          </div>
          {saving && <Loader2 className="animate-spin text-indigo-600" size={20} />}
        </div>
      </div>

      <div className="max-w-xl mx-auto mt-8 px-4">
        <form onSubmit={handleUpdate} className="space-y-6">
          
          {/* INTERACTIVE PHOTO GRID */}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((num) => {
              const key = `photo_${num}` as 'photo_1' | 'photo_2';
              const inputRef = num === 1 ? fileInputRef1 : fileInputRef2;
              const hasPhoto = !!photos[key];
              
              return (
                <div key={key} className="relative bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-100 aspect-square flex items-center justify-center overflow-hidden group">
                  <input type="file" hidden ref={inputRef} onChange={(e) => handleFileUpload(e, key)} accept="image/*" />
                  
                  {uploading === key ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-indigo-600" />
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Uploading</p>
                    </div>
                  ) : hasPhoto ? (
                    <>
                      <img src={photos[key]} className="w-full h-full rounded-[2rem] object-cover" alt={`Photo ${num}`} />
                      
                      {/* Confirmation Overlay */}
                      {confirmDelete === key ? (
                        <div className="absolute inset-0 bg-indigo-600/95 flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-200">
                          <AlertCircle className="text-white mb-2" size={24} />
                          <p className="text-[10px] font-bold text-white uppercase mb-3">Delete this photo?</p>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 bg-white/20 text-white rounded-lg text-[10px] font-bold uppercase">No</button>
                            <button type="button" onClick={() => { setPhotos(p => ({...p, [key]: ''})); setConfirmDelete(null); }} className="px-3 py-1.5 bg-white text-indigo-600 rounded-lg text-[10px] font-bold uppercase">Yes</button>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => setConfirmDelete(key)} className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <button type="button" onClick={() => inputRef.current?.click()} className="flex flex-col items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200 group-hover:border-indigo-200">
                        <Camera size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Add Image {num}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* SECTION 1: IDENTITY */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-5">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Profile Details</h3>
            <InputField label="Full Name" name="name" defaultValue={initialData.name} icon={<User size={16}/>} />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Date of Birth" name="dob" type="date" defaultValue={initialData.dob} />
              <InputField label="Time of Birth" name="time" type="time" defaultValue={initialData.time} />
            </div>
            <InputField label="Birth Place" name="place" defaultValue={initialData.place} icon={<MapPin size={16}/>} />
            <InputField label="Education" name="education" defaultValue={initialData.education} />
            <InputField label="Occupation" name="occupation" defaultValue={initialData.occupation} icon={<Briefcase size={16}/>} />
          </div>

          {/* SECTION 2: FAMILY & CONTACT */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-5">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Family & Relations</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Father's Name" name="father_name" defaultValue={initialData.father_name} icon={<Heart size={14}/>} />
              <InputField label="Mother's Name" name="mother_name" defaultValue={initialData.mother_name} icon={<Heart size={14}/>} />
            </div>
            <InputField label="Business Name" name="business" defaultValue={initialData.business} />
            <InputField label="Contact Number" name="contact_number" defaultValue={initialData.contact_number} />
          </div>

          <button 
            type="submit" 
            disabled={saving} 
            className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase italic shadow-2xl shadow-slate-200 hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-slate-300"
          >
            {saving ? "Processing Changes..." : <><Check size={20} /> Profile Update </>}
          </button>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, name, defaultValue, type = "text", icon }: any) {
  return (
    <div className="space-y-1 w-full">
      <label className="text-[10px] font-black text-slate-400 ml-5 uppercase tracking-tighter">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
        <input 
          name={name} 
          type={type} 
          defaultValue={defaultValue} 
          className={`w-full ${icon ? 'pl-12' : 'pl-5'} pr-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-700 font-bold text-sm outline-none transition-all placeholder:text-slate-300`}
        />
      </div>
    </div>
  );
}
