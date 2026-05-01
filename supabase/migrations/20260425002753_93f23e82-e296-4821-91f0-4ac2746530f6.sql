
DROP POLICY IF EXISTS "Anyone can report a missing product" ON public.missing_product_reports;

CREATE POLICY "Anyone can report a missing product"
ON public.missing_product_reports
FOR INSERT
WITH CHECK (
  product_name IS NOT NULL
  AND length(trim(product_name)) > 0
  AND length(product_name) < 1000
);
