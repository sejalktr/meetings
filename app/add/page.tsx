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

    // 1. Upload Photo 1
    const file1 = (e.currentTarget.elements.namedItem('photo1') as HTMLInputElement).files?.[0];
    let photo1Url = "";
    if (file1) {
      const { data } = await supabase.storage.from('user-photos').upload(`${contact}_1`, file1, { upsert: true });
      photo1Url = supabase.storage.from('user-photos').getPublicUrl(data?.path || "").data.publicUrl;
    }

    // 2. Save Data to Database
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
      <div className="max-w-md mx-auto mt-20 p-8 bg-green-50 rounded-3xl border-2 border-green-200 text-center">
        <h2 className="text-2xl font-bold text-green-700">🎉 Successfully Registered!</h2>
        <p className="mt-4 text-green-600">Save your private edit link. Do not share it.</p>
        <div className="mt-4 p-3 bg-white rounded-xl border select-all font-mono text-xs overflow-hidden">
          {editLink}
        </div>
        <button onClick={() => window.location.href = '/'} className="mt-6 bg-green-600 text-white px-6 py-2 rounded-full font-bold">Back to Directory</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto my-10 p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100">
      <h1 className="text-3xl font-black text-slate-800 mb-2">Join Directory</h1>
      <p className="text-slate-500 mb-8">Fill in your details to create a profile card.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Full Name" required className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500" />
        <div className="grid grid-cols-2 gap-4">
          <input name="dob" type="date" required className="p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200" />
          <input name="time" type="time" required className="p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200" />
        </div>
        <input name="place" placeholder="Place / City" required className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200" />
        <input name="occupation" placeholder="Occupation" required className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200" />
        <input name="contact_number" placeholder="Contact Number (Unique)" required className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200" />
        
        <div className="p-6 bg-indigo-50 rounded-3xl border-2 border-dashed border-indigo-200">
          <p className="text-sm font-bold text-indigo-600 mb-3">Profile Photo</p>
          <input name="photo1" type="file" accept="image/*" required className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-600 file:text-white" />
        </div>

        <button type="submit" disabled={status === 'loading'} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
          {status === 'loading' ? 'Processing...' : 'Create My Card'}
        </button>
      </form>
    </div>
  );
}
