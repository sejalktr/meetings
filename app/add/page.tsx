"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Camera, CheckCircle, Loader2, User, MapPin, 
  Briefcase, Calendar, Clock, Heart, ChevronLeft, Copy, X, Sparkles
} from 'lucide-react';

export default function JoinForm() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editLink, setEditLink] = useState("");
  
  const [previews, setPreviews] = useState<{ p1: string | null; p2: string | null }>({
    p1: null, p2: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, slot: 'p1' | 'p2') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(prev => ({ ...prev, [slot]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    
    // --- MANUAL VALIDATION ---
    const requiredFields = ['name', 'dob', 'place', 'occupation', 'contact_number'];
    const emptyFields = requiredFields.filter(field => !formData.get(field));
    
    if (emptyFields.length > 0) {
      alert(`Please fill in all required fields: ${emptyFields.join(', ')}`);
      return;
    }

    if (!formData.get('photo1')) {
      alert("Please upload at least the Primary Photo.");
      return;
    }

    setUploading(true);

    try {
      const file1 = formData.get('photo1') as File;
      const file2 = formData.get('photo2') as File;
      const token = crypto.randomUUID();
      let url1 = "";
      let url2 = "";

      if (file1 && file1.size > 0) {
        const path1 = `${Date.now()}_1_${file1.name}`;
        await supabase.storage.from('user-photos').upload(path1, file1);
        url1 = supabase.storage.from('user-photos').getPublicUrl(path1).data.publicUrl;
      }

      if (file2 && file2.size > 0) {
        const path2 = `${Date.now()}_2_${file2.name}`;
        await supabase.storage.from('user-photos').upload(path2, file2);
        url2 = supabase.storage.from('user-photos').getPublicUrl(path2).data.publicUrl;
      }

      const { error } = await supabase.from('entries').insert([{
        name: formData.get('name'),
        dob: formData.get('dob'),
        time: formData.get('time'),
        place: formData.get('place'),
        occupation: formData.get('occupation'), // MOVED HERE LOGICALLY
        business: formData.get('business'),
        father_name: formData.get('father_name'),
        mother_name: formData.get('mother_name'),
        contact_number: formData.get('contact_number'),
        photo_1: url1,
        photo_2: url2,
        edit_token: token
      }]);

      if (error) throw error;

      // SETUP SUCCESS POPUP
      const generatedUrl = `${window.location.origin}/edit/${token}`;
      setEditLink(generatedUrl);
      setShowSuccess(true);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-full transition-all">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-black tracking-tighter uppercase">Join Network</h1>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* PHOTO SECTION */}
          <section className="grid grid-cols-2 gap-4">
            <PhotoInput id="photo1" label="Primary Photo" preview={previews.p1} onChange={(e) => handleFileChange(e, 'p1')} />
            <PhotoInput id="photo2" label="Secondary" preview={previews.p2} onChange={(e) => handleFileChange(e, 'p2')} />
          </section>

          {/* PERSONAL DETAILS */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Personal Details</h3>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
              <InputField icon={<User size={18}/>} name="name" placeholder="Full Name *" />
              <div className="grid grid-cols-2 gap-4">
                <InputField icon={<Calendar size={18}/>} name="dob" type="date" />
                <InputField icon={<Clock size={18}/>} name="time" type="time" />
              </div>
              <InputField icon={<MapPin size={18}/>} name="place" placeholder="Birth City *" />
              {/* OCCUPATION MOVED HERE */}
              <InputField icon={<Briefcase size={18}/>} name="occupation" placeholder="Current Occupation *" />
            </div>
          </section>

          {/* FAMILY & ROOTS */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Family & Business</h3>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
              <InputField icon={<Heart size={18}/>} name="father_name" placeholder="Father's Name" />
              <InputField icon={<Heart size={18}/>} name="mother_name" placeholder="Mother's Name" />
              <InputField icon={<Sparkles size={18}/>} name="business" placeholder="Family Business Name" />
            </div>
          </section>

          {/* CONTACT */}
          <section className="space-y-4">
             <InputField icon={<MapPin size={18} className="text-emerald-500" />} name="contact_number" placeholder="Mobile / WhatsApp Number *" type="tel" />
          </section>

          <button 
            type="submit" 
            disabled={uploading}
            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200"
          >
            {uploading ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
            {uploading ? "Publishing..." : "Create Profile"}
          </button>
        </form>
      </main>

      {/* --- EDIT LINK POPUP (SUCCESS MODAL) --- */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">You're In!</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Your profile is live. Save this secret link to edit your details in the future. Anyone with this link can modify your card.
            </p>
            
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 mb-8">
              <input readOnly value={editLink} className="flex-1 bg-transparent border-none outline-none text-[10px] font-mono p-2 text-slate-500" />
              <button 
                onClick={() => {navigator.clipboard.writeText(editLink); alert("Copied!")}}
                className="bg-white p-3 rounded-xl shadow-sm hover:text-emerald-600 transition-colors"
              >
                <Copy size={18} />
              </button>
            </div>

            <button 
              onClick={() => router.push('/')}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-colors"
            >
              Go to Directory
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// UI HELPERS
function PhotoInput({ id, label, preview, onChange }: any) {
  return (
    <div className="relative h-48 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 overflow-hidden group hover:border-emerald-400 transition-all">
      {preview ? (
        <img src={preview} className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Camera size={28} />
          <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
      )}
      <input type="file" name={id} onChange={onChange} className="absolute inset-0 opacity-0 cursor-pointer" />
    </div>
  );
}

function InputField({ icon, ...props }: any) {
  return (
    <div className="relative flex items-center group">
      <div className="absolute left-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors">{icon}</div>
      <input 
        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-200 font-bold text-slate-700 transition-all placeholder:text-slate-300"
        {...props} 
      />
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
