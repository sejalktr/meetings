"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AddEntry() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [editLink, setEditLink] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    
    const formData = new FormData(e.currentTarget);
    const contact = formData.get('contact_number') as string;

    // 1. Upload Photo
    const file1 = (e.currentTarget.elements.namedItem('photo1') as HTMLInputElement).files?.[0];
    let photo1Url = "";
    if (file1) {
      const fileName = `${contact}_${Date.now()}`;
      const { data } = await supabase.storage.from('user-photos').upload(fileName, file1);
      if (data) {
        photo1Url = supabase.storage.from('user-photos').getPublicUrl(data.path).data.publicUrl;
      }
    }

    // 2. Save All Data to Supabase
    const { data, error } = await supabase.from('entries').insert([{
      name: formData.get('name'),
      dob: formData.get('dob'),
      time: formData.get('time'),
      place: formData.get('place'),
      education: formData.get('education'),
      occupation: formData.get('occupation'),
      father_name: formData.get('father_name'),
      mother_name: formData.get('mother_name'),
      business: formData.get('business'),
      contact_number: contact,
      photo_1: photo1Url
    }]).select();

    if (error) {
      alert("Error: " + error.message);
      setStatus('idle');
    } else {
      setEditLink(`${window.location.origin}/edit?token=${data[0].edit_token}`);
      setStatus('success');
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[2.5rem] shadow-2xl text-center border border-slate-100">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-800">Registration Successful!</h2>
        <p className="mt-2 text-slate-500">Keep this secret link to edit your profile later. Do not share it.</p>
        
        <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
          <code className="text-[10px] text-slate-600 truncate flex-1 font-mono">
            {editLink}
          </code>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(editLink);
              alert("Link copied to clipboard!");
            }}
            className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 active:scale-95 transition-all"
          >
            Copy
          </button>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button 
            onClick={() => window.location.href = '/'} 
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
          >
            Go to Directory Home
          </button>
          <button 
            onClick={() => setStatus('idle')} 
            className="text-slate-400 text-sm font-bold hover:text-slate-600"
          >
            Add Another Entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto my-10 p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100">
      <h1 className="text-3xl font-black text-slate-800 mb-2">Join Directory</h1>
      <p className="text-slate-500 mb-8">Fill in all details to create your community card.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Details */}
        <input name="name" placeholder="Full Name" required className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500" />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 ml-2 uppercase">Date of Birth</label>
            <input name="dob" type="date" required className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 ml-2 uppercase">Time of Birth</label>
            <input name="time" type="time" required className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200" />
          </div>
        </div>

        <input name="place" placeholder="Place / City of Birth" required className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200" />
        
        {/* Education & Work */}
        <input name="education" placeholder="Education (e.g. B.Tech, MBA)" className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200" />
        <input name="occupation" placeholder="Occupation / Job Title" required className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200" />
        <input name="business" placeholder="Business Name (If any)" className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200" />

        {/* Family Details */}
        <div className="grid grid-cols-2 gap-4">
          <input name="father_name" placeholder="Father's Name" className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200" />
          <input name="mother_name" placeholder="Mother's Name" className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200" />
        </div>

        {/* Contact (Locked Field) */}
        <input name="contact_number" placeholder="Mobile Number (Used for Login)" required className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200" />
        
        {/* Photo Upload */}
        <div className="p-6 bg-indigo-50 rounded-3xl border-2 border-dashed border-indigo-200">
          <p className="text-sm font-bold text-indigo-600 mb-3">Profile Photo</p>
          <input name="photo1" type="file" accept="image/*" required className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-600 file:text-white" />
        </div>

        <button type="submit" disabled={status === 'loading'} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
          {status === 'loading' ? 'Saving Your Profile...' : 'Create My Card'}
        </button>
      </form>
    </div>
  );
}
