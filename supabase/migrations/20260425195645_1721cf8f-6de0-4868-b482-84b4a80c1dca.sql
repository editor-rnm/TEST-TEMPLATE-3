ALTER TABLE public.missing_product_reports
  ADD COLUMN IF NOT EXISTS replacement_product text,
  ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS resolution_note text;

-- Allow anyone to update their own report row to either set a replacement product
-- or mark it as resolved (found). We scope this loosely since reports are not
-- tied to authenticated users — same model as the existing public INSERT policy.
DROP POLICY IF EXISTS "Anyone can update a missing product report" ON public.missing_product_reports;
CREATE POLICY "Anyone can update a missing product report"
ON public.missing_product_reports
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);