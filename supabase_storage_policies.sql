-- Storage policies for sleep-audio bucket
-- Run in Supabase SQL Editor after creating the bucket

-- Allow authenticated users to upload to their own folder
create policy "Users can upload sleep audio"
  on storage.objects for insert
  with check (
    bucket_id = 'sleep-audio'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read their own files
create policy "Users can read own sleep audio"
  on storage.objects for select
  using (
    bucket_id = 'sleep-audio'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update/delete their own files
create policy "Users can update own sleep audio"
  on storage.objects for update
  using (
    bucket_id = 'sleep-audio'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own sleep audio"
  on storage.objects for delete
  using (
    bucket_id = 'sleep-audio'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
