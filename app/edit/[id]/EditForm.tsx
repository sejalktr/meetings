"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { 
  Camera, CheckCircle, Loader2, User, MapPin, 
  Briefcase, Calendar, Clock, Heart, Trash2,
  Copy, ExternalLink, Sparkles, Phone, UserPlus, Share2, Save
} from 'lucide-react';

export default function EditProfile() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [photos, setPhotos] = useState<{ p1: File | string | null, p2: File | string | null }>({ p1: null, p2: null });

  // 1. FETCH EXISTING DATA
  const fetchProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('edit_token', token)
        .single();

      if (error || !data) {
        alert("Profile not found or invalid link.");
        router.push('/');
        return;
      }

      setProfileData(data);
      setPhotos({ p1: data.photo_1, p2: data.photo_2 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => {
    if (token) fetchProfile();
  }, [token, fetchProfile]);

  const removePhoto = (key: 'p1' | 'p2') => {
    setPhotos(prev => ({ ...prev, [key]: null }));
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/profile/${profileData.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: profileData.name, url: shareUrl });
      } catch (err) { console.log(err); }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Profile link copied!");
    }
  };

  // 2. HANDLE UPDATE
  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Validations
    const required = ['name', 'dob', 'place', 'education', 'occupation', 'contact_number'];
    for (const field of required) {
      if (!formData.get(field)) {
        alert(`Required: ${field.replace('_', ' ')}`);
        return;
      }
    }

    const contactNo = formData.get('contact_number') as string;
    if (!/^[0-9]{10}$/.test(contactNo)) {
      alert("Please enter a valid 10-digit contact number.");
      return;
    }

    setUpdating(true);

    try {
      let urls = { p1: photos.p1 as string, p2: photos.p2 as string };

      // Handle New Uploads
      for (const key of ['p1', 'p2'] as const) {
        const file = photos[key];
        if (file instanceof File) {
          const path = `profile-photos/${token}-${key}-${Date.now()}`;
          const { error: upErr } = await supabase.storage.from('user-photos').upload(path, file);
          if (upErr) throw upErr;
          urls[key] = supabase.storage.from('user-photos').getPublicUrl(path).data.publicUrl;
        } else if (file === null) {
          urls[key] = ''; // Image was deleted
        }
      }

      const { error: updErr } = await supabase
        .from('entries')
        .update({
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
          contact_number: contactNo,
          family_contact_1: formData.get('family_contact_1'),
          family_contact_2: formData.get('family_contact_2'),
          photo_1: urls.p1,
          photo_2: urls.p2,
        })
        .eq('edit_token', token);

      if (updErr) throw updErr;
      alert("Profile updated successfully!");
      router.push(`/profile/${profileData.id}`);
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* STICKY HEADER */}
      <div className="bg-white border-b p-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <Save size={16} />
            </div>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Edit Profile</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={handleShare} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Share2 size={20} />
            </button>
            <button onClick={() => router.back()} className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 transition-all">
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto mt-8 px-4">
        <form onSubmit={handleUpdate} className="space-y-6">
          
          {/* PHOTO SECTION WITH TRASH FUNCTION */}
          <div className="grid grid-cols-2 gap-4">
            {(['p1', 'p2'] as const).map((key, index) => (
              <div key={key} className="bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-100 aspect-square flex flex-col items-center justify-center overflow-hidden relative group">
                {photos[key] ? (
                  <>
                    <img 
                      src={photos[key] instanceof File ? URL.createObjectURL(photos[key] as File) : photos[key] as string} 
                      className="w-full h-full object-cover rounded-[2rem]" 
                      alt="preview" 
                    />
                    <button 
                      type="button"
                      onClick={() => removePhoto(key)}
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all z-20"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setPhotos(prev => ({...prev, [key]: e.target.files?.[0] || null}))} />
                    <div className="text-slate-400 flex flex-col items-center gap-2 group-hover:text-indigo-500 transition-colors">
                      <Camera size={24} />
                      <span className="text-[10px] font-bold uppercase">Change Photo {index + 1}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* PERSONAL INFO */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-5">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Personal Details</h3>
            <InputField label="Full Name *" name="name" defaultValue={profileData.name} icon={<User size={16}/>} />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Date of Birth *" name="dob" type="date" defaultValue={profileData.dob} icon={<Calendar size={16}/>} />
              <InputField label="Time of Birth" name="time" type="time" defaultValue={profileData.time} icon={<Clock size={16}/>} />
            </div>
            <InputField label="Birth Place *" name="place" defaultValue={profileData.place} icon={<MapPin size={16}/>} />
            <InputField label="Gotra" name="gotra" defaultValue={profileData.gotra} />
            <InputField label="Education *" name="education" defaultValue={profileData.education} />
            <InputField label="Occupation *" name="occupation" defaultValue={profileData.occupation} icon={<Briefcase size={16}/>} />
            <InputField label="Hobbies" name="hobbies" defaultValue={profileData.hobbies} />
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 ml-5 uppercase">Describe Yourself</label>
              <textarea name="bio" rows={3} defaultValue={profileData.bio} className="w-full px-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-700 font-bold text-sm outline-none" />
            </div>
          </div>

          {/* FAMILY & CONTACT - FULL WIDTH 1-LINERS */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-5">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Family & Contact</h3>
            <InputField label="Father's Name" name="father_name" defaultValue={profileData.father_name} icon={<Heart size={16}/>} />
            <InputField label="Mother's Name" name="mother_name" defaultValue={profileData.mother_name} icon={<Heart size={16}/>} />
            <InputField label="Family Business" name="business" defaultValue={profileData.business} icon={<Sparkles size={16}/>} />
            
            <div className="pt-4 border-t border-slate-100 space-y-5">
              <InputField label="Primary Contact *" name="contact_number" type="tel" maxLength={10} defaultValue={profileData.contact_number} icon={<Phone size={16}/>} />
              <InputField label="Family Contact 1" name="family_contact_1" defaultValue={profileData.family_contact_1} />
              <InputField label="Family Contact 2" name="family_contact_2" defaultValue={profileData.family_contact_2} />
            </div>
          </div>

          <button disabled={updating} className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-tight shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all hover:bg-emerald-600">
            {updating ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
            {updating ? "Saving Changes..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, name, type = "text", icon, defaultValue, maxLength }: any) {
  return (
    <div className="space-y-1 w-full text-left font-sans">
      <label className="text-[10px] font-bold text-slate-400 ml-5 uppercase tracking-tighter">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
        <input 
          name={name} 
          type={type} 
          maxLength={maxLength}
          defaultValue={defaultValue}
          className={`w-full ${icon ? 'pl-12' : 'pl-5'} pr-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-700 font-bold text-sm outline-none transition-all`} 
        />
      </div>
    </div>
  );
}  
