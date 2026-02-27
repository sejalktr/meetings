import { supabase } from '@/lib/supabase';
import { EditForm } from './EditForm';
import { Suspense } from 'react';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch data on the server to prevent client-side "Load Failed" errors
  const { data: entry } = await supabase
    .from('entries')
    .select('*')
    .eq('edit_token', id)
    .single();

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-xl font-black text-red-500 uppercase italic">Link Invalid</h1>
        <p className="text-slate-500">We couldn't find a record for this token.</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading UI...</div>}>
      <EditForm initialData={entry} token={id} />
    </Suspense>
  );
}
