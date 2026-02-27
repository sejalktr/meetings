import { supabase } from '@/lib/supabase';
import { EditForm } from './EditForm';
import { Suspense } from 'react';

// Force dynamic ensures the page always fetches fresh data on every visit
export const dynamic = 'force-dynamic';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: entry } = await supabase
    .from('entries')
    .select('*')
    .eq('edit_token', id)
    .single();

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center bg-slate-50 p-6">
        <h1 className="text-2xl font-black text-red-500 uppercase italic">Access Denied</h1>
        <p className="text-slate-400 mt-2">Invalid or expired edit details.</p>
        <p className="text-slate-500">We couldn't find a record with this entry.</p>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <EditForm initialData={entry} token={id} />
    </Suspense>
  );
}
