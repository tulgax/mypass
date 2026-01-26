-- Create membership_plans table
CREATE TABLE IF NOT EXISTS membership_plans (
  id BIGSERIAL PRIMARY KEY,
  studio_id BIGINT NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_months INTEGER NOT NULL CHECK (duration_months > 0),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'MNT',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  membership_plan_id BIGINT NOT NULL REFERENCES membership_plans(id) ON DELETE RESTRICT,
  studio_id BIGINT NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  qr_code TEXT,
  payment_id BIGINT REFERENCES payments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create membership_check_ins table
CREATE TABLE IF NOT EXISTS membership_check_ins (
  id BIGSERIAL PRIMARY KEY,
  membership_id BIGINT NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_in_method TEXT NOT NULL CHECK (check_in_method IN ('student_qr', 'gym_qr')),
  checked_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_membership_plans_studio_id ON membership_plans(studio_id);
CREATE INDEX IF NOT EXISTS idx_membership_plans_is_active ON membership_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_memberships_student_id ON memberships(student_id);
CREATE INDEX IF NOT EXISTS idx_memberships_studio_id ON memberships(studio_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_expires_at ON memberships(expires_at);
CREATE INDEX IF NOT EXISTS idx_memberships_qr_code ON memberships(qr_code);
CREATE INDEX IF NOT EXISTS idx_membership_check_ins_membership_id ON membership_check_ins(membership_id);
CREATE INDEX IF NOT EXISTS idx_membership_check_ins_checked_in_at ON membership_check_ins(checked_in_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_membership_plans_updated_at
  BEFORE UPDATE ON membership_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate membership QR code
CREATE OR REPLACE FUNCTION generate_membership_qr_code(membership_id_param BIGINT)
RETURNS TEXT AS $$
DECLARE
  qr_string TEXT;
  timestamp_val BIGINT;
BEGIN
  timestamp_val := EXTRACT(EPOCH FROM NOW())::BIGINT * 1000;
  qr_string := 'membership-' || membership_id_param::TEXT || '-' || timestamp_val::TEXT;
  
  UPDATE memberships
  SET qr_code = qr_string
  WHERE id = membership_id_param;
  
  RETURN qr_string;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check membership validity
CREATE OR REPLACE FUNCTION check_membership_validity(membership_id_param BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
  membership_record RECORD;
BEGIN
  SELECT status, expires_at INTO membership_record
  FROM memberships
  WHERE id = membership_id_param;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  IF membership_record.status != 'active' THEN
    RETURN FALSE;
  END IF;
  
  IF membership_record.expires_at < NOW() THEN
    -- Auto-expire the membership
    UPDATE memberships
    SET status = 'expired'
    WHERE id = membership_id_param;
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to expire memberships (for scheduled jobs)
CREATE OR REPLACE FUNCTION expire_memberships()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE memberships
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_check_ins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for membership_plans
-- Studio owners can CRUD their own plans
CREATE POLICY "Studio owners can view their own membership plans"
  ON membership_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM studios
      WHERE studios.id = membership_plans.studio_id
      AND studios.owner_id = auth.uid()
    )
  );

CREATE POLICY "Studio owners can create their own membership plans"
  ON membership_plans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM studios
      WHERE studios.id = membership_plans.studio_id
      AND studios.owner_id = auth.uid()
    )
  );

CREATE POLICY "Studio owners can update their own membership plans"
  ON membership_plans FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM studios
      WHERE studios.id = membership_plans.studio_id
      AND studios.owner_id = auth.uid()
    )
  );

CREATE POLICY "Studio owners can delete their own membership plans"
  ON membership_plans FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM studios
      WHERE studios.id = membership_plans.studio_id
      AND studios.owner_id = auth.uid()
    )
  );

-- RLS Policies for memberships
-- Students can read their own memberships
CREATE POLICY "Students can view their own memberships"
  ON memberships FOR SELECT
  USING (student_id = auth.uid());

-- Studio owners can read memberships for their studio
CREATE POLICY "Studio owners can view memberships for their studio"
  ON memberships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM studios
      WHERE studios.id = memberships.studio_id
      AND studios.owner_id = auth.uid()
    )
  );

-- Students can create memberships (purchase)
CREATE POLICY "Students can create their own memberships"
  ON memberships FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Studio owners can update memberships for their studio
CREATE POLICY "Studio owners can update memberships for their studio"
  ON memberships FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM studios
      WHERE studios.id = memberships.studio_id
      AND studios.owner_id = auth.uid()
    )
  );

-- RLS Policies for membership_check_ins
-- Studio owners can read/create for their studio
CREATE POLICY "Studio owners can view check-ins for their studio"
  ON membership_check_ins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      JOIN studios ON studios.id = memberships.studio_id
      WHERE memberships.id = membership_check_ins.membership_id
      AND studios.owner_id = auth.uid()
    )
  );

-- Students can read their own check-ins
CREATE POLICY "Students can view their own check-ins"
  ON membership_check_ins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.id = membership_check_ins.membership_id
      AND memberships.student_id = auth.uid()
    )
  );

-- Studio owners can create check-ins for their studio
CREATE POLICY "Studio owners can create check-ins for their studio"
  ON membership_check_ins FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships
      JOIN studios ON studios.id = memberships.studio_id
      WHERE memberships.id = membership_check_ins.membership_id
      AND studios.owner_id = auth.uid()
    )
  );

-- Students can create check-ins for their own memberships (gym QR method)
CREATE POLICY "Students can create check-ins for their own memberships"
  ON membership_check_ins FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.id = membership_check_ins.membership_id
      AND memberships.student_id = auth.uid()
    )
  );
