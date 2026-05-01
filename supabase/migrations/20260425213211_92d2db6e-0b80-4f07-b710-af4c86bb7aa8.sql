DROP POLICY IF EXISTS "Anyone can report a missing product" ON public.missing_product_reports;
CREATE POLICY "Anyone can report a missing product"
ON public.missing_product_reports
FOR INSERT
TO public
WITH CHECK (true);