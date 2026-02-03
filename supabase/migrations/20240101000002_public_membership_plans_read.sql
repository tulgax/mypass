-- Allow public (anon) to read active membership plans for public studio profiles
CREATE POLICY "Public can view active membership plans"
  ON membership_plans FOR SELECT
  USING (is_active = true);
