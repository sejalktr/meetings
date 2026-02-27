"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, User, Briefcase, MapPin, Heart } from 'lucide-react';

export function EditForm({ initialData, token }: { initialData: any, token: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

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
      photo_1: form.get('photo_1'),
      photo_2: form.get('photo_2'),
    };

    const { error } = await supabase.from('entries').update(updates).eq('edit_token', token);

    setSaving(false);
    if (error) alert("Error: " + error.message);
    else {
      alert("Profile updated!");
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <div className="bg-white border-b sticky top-0 z-10 p-4">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-slate-800 uppercase">Edit Profile</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto mt-8 px-4">
        <form onSubmit={handleUpdate} className="space-y-6">
          
          {/* PHOTO GALLERY */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
             <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col items-center">
                    <img src={initialData.photo_1 || 'https://via.placeholder.com/150'} className="w-full aspect-square rounded-[2rem] object-cover border-4 border-white shadow-md mb-4" />
                    <InputField label="Photo 1 URL" name="photo_1" defaultValue={initialData.photo_1} />
                </div>
                <div className="flex flex-col items-center">
                    <img src={initialData.photo_2 || 'https://via.placeholder.com/150'} className="w-full aspect-square rounded-[2rem] object-cover border-4 border-white shadow-md mb-4" />
                    <InputField label="Photo 2 URL" name="photo_2" defaultValue={initialData.photo_2} />
                </div>
             </div>
          </div>

          {/* PERSONAL & CAREER */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-5">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Personal & Career</h3>
            <InputField label="Full Name" name="name" defaultValue={initialData.name} icon={<User size={16}/>} />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Date of Birth" name="dob" type="date" defaultValue={initialData.dob} />
              <InputField label="Time of Birth" name="time" type="time" defaultValue={initialData.time} />
            </div>
            <InputField label="Birth Place" name="place" defaultValue={initialData.place} icon={<MapPin size={16}/>} />
            <InputField label="Education" name="education" defaultValue={initialData.education} />
            <InputField label="Occupation" name="occupation" defaultValue={initialData.occupation} icon={<Briefcase size={16}/>} />
          </div>

          {/* FAMILY SECTION */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-5">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Family & Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Father's Name" name="father_name" defaultValue={initialData.father_name} icon={<Heart size={14}/>} />
              <InputField label="Mother's Name" name="mother_name" defaultValue={initialData.mother_name} icon={<Heart size={14}/>} />
            </div>
            <InputField label="Business Name" name="business" defaultValue={initialData.business} />
            <InputField label="Contact Number" name="contact_number" defaultValue={initialData.contact_number} />
          </div>

          <button type="submit" disabled={saving} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase shadow-xl">
            {saving ? "Updating..." : <><Save size={20} /> Save Profile Updates</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, name, defaultValue, type = "text", icon }: any) {
  return (
    <div className="space-y-1 w-full">
      <label className="text-[10px] font-bold text-slate-400 ml-3 uppercase">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
        <input name={name} type={type} defaultValue={defaultValue} className={`w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-700 font-bold text-sm outline-none`} />
      </div>
    </div>
  );
}
