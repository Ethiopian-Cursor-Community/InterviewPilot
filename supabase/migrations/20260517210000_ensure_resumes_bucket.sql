-- Ensure resume PDF storage exists (safe to re-run on hosted Supabase)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', false, 5242880, array['application/pdf']::text[])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "resumes_storage_select" on storage.objects;
drop policy if exists "resumes_storage_insert" on storage.objects;
drop policy if exists "resumes_storage_update" on storage.objects;
drop policy if exists "resumes_storage_delete" on storage.objects;

create policy "resumes_storage_select" on storage.objects
  for select
  using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "resumes_storage_insert" on storage.objects
  for insert
  with check (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "resumes_storage_update" on storage.objects
  for update
  using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "resumes_storage_delete" on storage.objects
  for delete
  using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
