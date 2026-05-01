CREATE TABLE public.extra_video_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id TEXT,
  creator_name TEXT,
  account_name TEXT,
  product_name TEXT NOT NULL,
  assignment_date TEXT,
  video_style TEXT,
  assignment_order TEXT,
  extra_count INTEGER NOT NULL DEFAULT 1,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.extra_video_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can report extra video versions"
ON public.extra_video_reports
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update an extra video report"
ON public.extra_video_reports
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can view extra video reports"
ON public.extra_video_reports
FOR SELECT
TO authenticated
USING (true);