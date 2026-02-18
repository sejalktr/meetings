"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Camera, 
  CheckCircle, 
  Loader2, 
  User, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Clock, 
  GraduationCap, 
  Heart,
  ChevronLeft
} from 'lucide-react';

export default function JoinForm() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<{ p1: string | null; p2: string | null }>({
    p1: null,
    p2: null,
  });

  // Handle image preview before uploading
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, slot: 'p1' | 'p2') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({ ...prev, [slot]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    const file1 = formData.get('photo1') as File;
    const file2 = formData.get('photo2') as File;

    try {
      let url1 = "";
      let url2 = "";

      // 1. Upload Primary Photo
      if (file1 && file1.size > 0) {
        //const cleanFileName1 = `${contact.replace(/\s+/g, '-')}-${Date.now()-1-${photo1.name}`;
        const path1 = `${Date.now()}_main_${file1.name}`;
        await supabase.storage.from('user-photos').upload(path1, file1);
        url1 = supabase.storage.from('user-photos').getPublicUrl(path1).data.publicUrl;
      }

      // 2. Upload Secondary Photo
      if (file2 && file2.size > 0) {
        const path2 = `${Date.now()}_sec_${file2.name}`;
        await supabase.storage.from('user-photos').upload(path2, file2);
        url2 = supabase.storage.from('user-photos').getPublicUrl(path2).data.publicUrl;
      }

      // 3. Insert Data to Supabase
      const { error } = await supabase.from('entries').insert([{
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
        photo_1: url1,
        photo_2: url2,
        edit_token: crypto.randomUUID(), // Secret key for future editing
      }]);

      if (error) throw error;

      alert("Profile Created Successfully!");
      router.push('/');
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      {/* HEADER */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-black tracking-tight">Create Profile</h1>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* PHOTO UPLOAD SECTION */}
          <section className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Profile Photos</label>
            <div className="grid grid-cols-2 gap-4">
              <PhotoSlot 
                id="photo1" 
                label="Main Photo" 
                preview={previews.p1} 
                onChange={(e) => handleFileChange(e, 'p1')} 
                required 
              />
              <PhotoSlot 
                id="photo2" 
                label="Life / Work" 
                preview={previews.p2} 
                onChange={(e) => handleFileChange(e, 'p2')} 
              />
            </div>
          </section>

          {/* BASIC INFORMATION */}
          <section className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Personal Details</label>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
              <InputField icon={<User size={18}/>} name="name" placeholder="Full Name" required />
              <div className="grid grid-cols-2 gap-4">
                <InputField icon={<Calendar size={18}/>} name="dob" type="date" required />
                <InputField icon={<Clock size={18}/>} name="time" type="time" required />
              </div>
              <InputField icon={<MapPin size={18}/>} name="place" placeholder="Birth City" required />
              <InputField icon={<GraduationCap size={18}/>} name="education" placeholder="Highest Education" />
            </div>
          </section>

          {/* WORK & FAMILY */}
          <section className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Work & Family</label>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
              <InputField icon={<Briefcase size={18}/>} name="occupation" placeholder="Current Occupation" required />
              <InputField icon={<Briefcase size={18}/>} name="business" placeholder="Business Name (Optional)" />
              <div className="pt-4 border-t border-slate-50 space-y-4">
                <InputField icon={<Heart size={18}/>} name="father_name" placeholder="Father's Name" />
                <InputField icon={<Heart size={18}/>} name="mother_name" placeholder="Mother's Name" />
              </div>
            </div>
          </section>

          {/* CONTACT */}
          <section className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Contact</label>
            <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100">
              <InputField icon={<CheckCircle size={18} className="text-emerald-500"/>} name="contact_number" placeholder="WhatsApp / Mobile Number" type="tel" required />
            </div>
          </section>

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" 
            disabled={uploading}
            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-slate-200 flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <> <Loader2 className="animate-spin" size={24} /> Processing... </>
            ) : (
              "Publish Profile"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

// UI HELPER: Photo Upload Box
function PhotoSlot({ id, label, preview, onChange, required }: any) {
  return (
    <div className="relative h-56 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 overflow-hidden group hover:border-emerald-400 transition-all">
      {preview ? (
        <img src={preview} alt="preview" className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-emerald-500 transition-colors">
            <Camera size={28} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
        </div>
      )}
      <input 
        type="file" 
        name={id} 
        onChange={onChange} 
        accept="image/*" 
        required={required}
        className="absolute inset-0 opacity-0 cursor-pointer" 
      />
    </div>
  );
}

// UI HELPER: Minimal Input
function InputField({ icon, ...props }: any) {
  return (
    <div className="relative flex items-center group">
      <div className="absolute left-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
        {icon}
      </div>
      <input 
        className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-emerald-200 focus:bg-white transition-all text-slate-700 font-medium placeholder:text-slate-300"
        {...props} 
      />
    </div>
  );
}
