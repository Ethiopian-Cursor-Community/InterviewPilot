import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const RESUMES_BUCKET = "resumes";

let bucketReady: Promise<void> | undefined;

export async function ensureResumesBucket(
  admin: SupabaseClient<Database>,
): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      const { data: buckets, error: listErr } = await admin.storage.listBuckets();
      if (listErr) throw new Error(`Storage setup failed: ${listErr.message}`);

      if (buckets?.some((b) => b.id === RESUMES_BUCKET || b.name === RESUMES_BUCKET)) {
        return;
      }

      const { error: createErr } = await admin.storage.createBucket(RESUMES_BUCKET, {
        public: false,
        fileSizeLimit: 5 * 1024 * 1024,
        allowedMimeTypes: ["application/pdf"],
      });

      if (createErr && !/already exists|duplicate/i.test(createErr.message)) {
        throw new Error(`Storage setup failed: ${createErr.message}`);
      }
    })();
  }

  await bucketReady;
}

export function formatStorageError(message: string): string {
  if (/bucket not found/i.test(message)) {
    return (
      'Resume storage bucket "resumes" is missing. In Supabase → SQL Editor, run the migration ' +
      "supabase/migrations/20260517210000_ensure_resumes_bucket.sql, or create a private bucket named resumes."
    );
  }
  return message;
}
