"use client";
import React, { useEffect, useState, Suspense, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Camera, User, Briefcase, MapPin, Sparkles } from 'lucide-react';

// --- EDITFORM COMPONENT ---
function EditForm({ token }: { token: string }) {
  const router = useRouter();
  
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!token) return;
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('edit_token', token)
        .single();
      
      if (data) setFormData(data);
      setLoading(false);
    }
    loadData();
  }, [token]);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    
    const form = new FormData(e.currentTarget);
    
    // Updated to include both photos
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
      photo_1: form.get('photo_1'), // Capturing URL/string from input
      photo_2: form.get('photo_2'), // Capturing second photo URL
    };

    const { error } = await supabase
      .from('entries')
      .update(updates)
      .eq('edit_token', token);

    setSaving(false);
    
    if (error) {
      alert("Update failed: " + error.message);
    } else {
      alert("Profile updated successfully!");
      router.push('/');
    }
  }
  
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">Syncing with Mumbai Database...</p>
    </div>
  );

  if (!formData) return (
    <div className="text-center mt-20">
      <h2 className="text-xl font-black text-red-500 uppercase italic">Invalid or Expired Link</h2>
      <p className="text-slate-500 text-sm mt-2">We couldn't find a profile matching this URL.</p>
      <button onClick={() => router.push('/')} className="mt-4 text-indigo-600 font-bold underline">Go Back Home</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-10 p-4">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">Edit Profile</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto mt-8 px-4">
        <form onSubmit={handleUpdate} className="space-y-6">
          
          {/* PHOTO BOX - NOW WITH TWO PHOTOS */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
             <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-6 text-center">Profile Gallery</h3>
             <div className="grid grid-cols-2 gap-6">
                {/* Photo 1 Preview */}
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <img 
                      src={formData.photo_1 || 'https://via.placeholder.com/150'} 
                      className="w-full aspect-square rounded-[2rem] object-cover border-4 border-white shadow-md mb-2"
                      alt="Primary"
                    />
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg">
                      <Sparkles size={12} />
                    </div>
                  </div>
                  <InputField label="Primary Photo URL" name="photo_1" defaultValue={formData.photo_1} />
                </div>

                {/* Photo 2 Preview */}
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <img 
                      src={formData.photo_2 || 'https://via.placeholder.com/150'} 
                      className="w-full aspect-square rounded-[2rem] object-cover border-4 border-white shadow-md mb-2"
                      alt="Secondary"
                    />
                    <div className="absolute top-2 right-2 bg-slate-400 text-white p-1.5 rounded-full shadow-lg">
                      <Camera size={12} />
                    </div>
                  </div>
                  <InputField label="Secondary Photo URL" name="photo_2" defaultValue={formData.photo_2} />
                </div>
             </div>
          </div>

          {/* FORM FIELDS */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-5">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Identity Details</h3>
            <InputField label="Full Name" name="name" defaultValue={formData.name} icon={<User size={16}/>} />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Date of Birth" name="dob" type="date" defaultValue={formData.dob} />
              <InputField label="Time of Birth" name="time" type="time" defaultValue={formData.time} />
            </div>
            <InputField label="Birth Place" name="place" defaultValue={formData.place} icon={<MapPin size={16}/>} />
            
            <hr className="my-6 border-slate-100" />
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Work & Education</h3>
            <InputField label="Education" name="education" defaultValue={formData.education} />
            <InputField label="Occupation" name="occupation" defaultValue={formData.occupation} icon={<Briefcase size={16}/>} />
            
            <hr className="my-6 border-slate-100" />
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Family & Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Father's Name" name="father_name" defaultValue={formData.father_name} />
              <InputField label="Mother's Name" name="mother_name" defaultValue={formData.mother_name} />
            </div>
            <InputField label="Business Name" name="business" defaultValue={formData.business} />
            <InputField label="Contact Number" name="contact_number" defaultValue={formData.contact_number} />
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 uppercase italic tracking-wider"
          >
            {saving ? "Updating..." : <><Save size={20} /> Profile updated </>}
          </button>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, name, defaultValue, type = "text", icon }: any) {
  return (
    <div className="space-y-1 w-full">
      <label className="text-[10px] font-bold text-slate-400 ml-3 uppercase tracking-tighter">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
        <input 
          name={name} 
          type={type} 
          defaultValue={defaultValue} 
          className={`w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700 font-bold text-sm`}
        />
      </div>
    </div>
  );
}

// --- WRAPPER ---
export default function EditPageWrapper({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen font-black uppercase italic text-slate-200 text-2xl">Initializing...</div>}>
      <EditForm token={resolvedParams.id} />
    </Suspense>
  );
}
