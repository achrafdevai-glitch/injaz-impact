create policy "own submissions upload" on storage.objects for insert to authenticated
with check (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "own or admin read submissions" on storage.objects for select to authenticated
using (bucket_id = 'submissions' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin(auth.uid())));