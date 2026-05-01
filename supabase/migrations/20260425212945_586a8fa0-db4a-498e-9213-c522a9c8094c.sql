DROP POLICY IF EXISTS "Anyone can report a missing product" ON public.missing_product_reports;
DROP POLICY IF EXISTS "Anyone can update a missing product report" ON public.missing_product_reports;

CREATE POLICY "Anyone can report a missing product"
ON public.missing_product_reports
FOR INSERT
TO anon, authenticated
WITH CHECK (
  product_name IS NOT NULL
  AND length(trim(both from product_name)) > 0
  AND length(product_name) < 1000
);

CREATE POLICY "Anyone can update a missing product report"
ON public.missing_product_reports
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);