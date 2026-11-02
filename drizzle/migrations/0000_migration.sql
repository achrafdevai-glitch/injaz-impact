CREATE TABLE public.volunteer_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  gender text NOT NULL,
  education text NOT NULL,
  work_type text NOT NULL,
  free_days text[] NOT NULL DEFAULT '{}',
  wilaya int NOT NULL CHECK (wilaya BETWEEN 1 AND 58),
  commune text NOT NULL,
  id_card_path text NOT NULL,
  ai_review jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_registrations TO authenticated;
GRANT ALL ON public.volunteer_registrations TO service_role;
ALTER TABLE public.volunteer_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.volunteer_registrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.volunteer_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.volunteer_registrations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.volunteer_registrations FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.deletion_requests TO authenticated;
GRANT ALL ON public.deletion_requests TO service_role;
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.deletion_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.deletion_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "id cards own read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'id-cards' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "id cards own insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'id-cards' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "id cards own update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'id-cards' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "id cards own delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'id-cards' AND (storage.foldername(name))[1] = auth.uid()::text);