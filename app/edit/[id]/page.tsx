import { supabase } from '@/lib/supabase';
import EditForm from './EditForm';
import { Suspense } from 'react';

// 1. Force the page to be dynamic (never cached)
export const dynamic = 'force-dynamic';
// 2. Ensure the fetch doesn't use the cache
export const revalidate = 0;

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: entry } = await supabase.from('entries').select('*').eq('edit_token', id).single();

  if (!entry) 
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center bg-slate-50 p-6">
        <h1 className="text-2xl font-black text-black-400 uppercase">Access Denied</h1>
        <p className="text-slate-300 mt-2">Invalid or expired edit token.</p>
        <p className="text-slate-300">We couldn't find a record with this entry.</p>
      </div>
    );
  
  return (
    <Suspense fallback={<div className="p-20 text-center font-black italic text-slate-200 uppercase tracking-widest">Loading your details ...</div>}>
      <EditForm initialData={entry} token={id} />
    </Suspense>
  );
}
