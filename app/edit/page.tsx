"use client";
import React, { useEffect, useState, Suspense, use } from 'react'; // Added 'use' hook
import { supabase } from '@/lib/supabase';
import { useSearchParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Camera, User, Briefcase, MapPin } from 'lucide-react';

// 1. Define the Page Props for Next.js 15
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditForm({ params }: PageProps) {
  // 2. Unwrap the ID from the URL path (the [id] folder)
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('id');
  
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;

      // We query by 'edit_token' using the 'id' from the URL
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('edit_token', id)
        .single();
      
      if (data) setFormData(data);
      setLoading(false);
    }
    loadData();
  }, [id]);

    
  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData(e.currentTarget);
    
    // Create an object with the exact column names from your Supabase table
    const updates = {
      name: formData.get('name'),
      dob: formData.get('dob'),
      time: formData.get('time'),
      place: formData.get('place'),
      education: formData.get('education'),
      occupation: formData.get('occupation'),
      business: formData.get('business'),
      father_name: formData.get('father_name'),
      mother_name: formData.get('mother_name'),
      contact_number: formData.get('contact_number'),
    };

    console.log("Sending updates to Supabase:", updates);

    const { error } = await supabase
      .from('entries')
      .update(updates)
      .eq('edit_token', id);

    setSaving(false);
    
    if (error) {
      console.error("Supabase Error:", error);
      alert("Update failed: " + error.message);
    } else {
      alert("Profile updated successfully!");
      router.push('/');
    }
  }
  
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium">Fetching your Profile...</p>
    </div>
  );

  if (!formData) return (
    <div className="text-center mt-20 p-6">
      <h2 className="text-xl font-bold text-red-500">Invalid or Expired Edit Link</h2>
      <p className="text-slate-500 text-sm mt-2">We couldn't find a profile matching this URL.</p>
      <button onClick={() => router.push('/')} className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold">Go Home</button>
    </div>
  );
      
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-10 p-4">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-slate-800">Edit Profile</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto mt-8 px-4">
        <form onSubmit={handleUpdate} className="space-y-6">
          
          {/* PHOTO THUMBNAIL BOX */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="relative group">
              <img 
                src={formData.photo_1 || 'https://via.placeholder.com/150'} 
                className="w-32 h-32 rounded-[2rem] object-cover border-4 border-white shadow-md mb-2"
                alt="Profile"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Current Profile Photo</p>
          </div>

          {/* FORM FIELDS */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-5">
            <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4">Personal Information</h3>
            
            <InputField label="Full Name" name="name" defaultValue={formData.name} icon={<User size={16}/>} />
            
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Date of Birth" name="dob" type="date" defaultValue={formData.dob} />
              <InputField label="Time of Birth" name="time" type="time" defaultValue={formData.time} />
            </div>

            <InputField label="Birth Place" name="place" defaultValue={formData.place} icon={<MapPin size={16}/>} />
            
            <hr className="my-6 border-slate-100" />
            <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4">Work & Education</h3>
            
            <InputField label="Education" name="education" defaultValue={formData.education} />
            <InputField label="Occupation" name="occupation" defaultValue={formData.occupation} icon={<Briefcase size={16}/>} />
            
            <hr className="my-6 border-slate-100" />
            <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4">Family & Contact</h3>
            
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
            className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            {saving ? "Saving Changes..." : <><Save size={20} /> Save Profile Updates</>}
          </button>
        </form>
      </div>
    </div>
  );
}

// Helper component for styled inputs with labels
function InputField({ label, name, defaultValue, type = "text", icon }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 ml-3 uppercase tracking-tighter">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
        <input 
          name={name} 
          type={type} 
          defaultValue={defaultValue} 
          className={`w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700 font-medium`}
        />
      </div>
    </div>
  );
}

// Wrapper for Suspense (Required for useSearchParams in Next.js)
export default function EditPageWrapper() {
  return (
    <Suspense fallback={<p className="text-center mt-20">Loading...</p>}>
      <EditForm />
    </Suspense>
  );
}
