
CREATE TABLE public.missing_product_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id TEXT,
  creator_name TEXT,
  account_name TEXT,
  product_name TEXT NOT NULL,
  assignment_date TEXT,
  video_style TEXT,
  assignment_order TEXT,
  notes TEXT,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.missing_product_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can report a missing product"
ON public.missing_product_reports
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can view reports"
ON public.missing_product_reports
FOR SELECT
TO authenticated
USING (true);

CREATE INDEX idx_missing_product_reports_reported_at
ON public.missing_product_reports (reported_at DESC);
