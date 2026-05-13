/*
  # MessMind AI - Initial Schema

  1. New Tables
    - `profiles` - Extended user profiles with role, hostel info
    - `meals` - Meal definitions (breakfast, lunch, snacks, dinner)
    - `menus` - Daily menu schedules
    - `menu_meals` - Junction table linking menus to meals
    - `meal_bookings` - Student meal bookings
    - `meal_attendance` - QR scan / consumption tracking
    - `wallets` - Student credit wallets
    - `wallet_transactions` - Credit transaction history
    - `complaints` - Anonymous complaint system
    - `notifications` - User notifications
    - `favourite_meals` - Student favourite meals
    - `penalty_records` - Penalty/no-show records
    - `waste_reports` - Food waste analytics
    - `canteen_orders` - Canteen order management
    - `canteen_items` - Canteen menu items

  2. Security
    - RLS enabled on all tables
    - Policies for authenticated access by role
*/

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'mess_admin', 'super_admin', 'staff')),
  student_id text,
  hostel_name text,
  room_number text,
  phone text,
  avatar_url text,
  diet_preference text DEFAULT 'veg' CHECK (diet_preference IN ('veg', 'non_veg', 'both')),
  mess_id text DEFAULT 'mess_1',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin')
    )
  );

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Meals table
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snacks', 'dinner')),
  description text DEFAULT '',
  is_veg boolean DEFAULT true,
  calories integer DEFAULT 0,
  protein integer DEFAULT 0,
  carbs integer DEFAULT 0,
  fat integer DEFAULT 0,
  allergens text[] DEFAULT '{}',
  is_spicy boolean DEFAULT false,
  image_url text,
  popularity_score integer DEFAULT 50,
  mess_id text DEFAULT 'mess_1',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view meals"
  ON meals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert meals"
  ON meals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update meals"
  ON meals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin')
    )
  );

-- Menus table
CREATE TABLE IF NOT EXISTS menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snacks', 'dinner')),
  serving_time text NOT NULL,
  cutoff_time timestamptz NOT NULL,
  mess_id text DEFAULT 'mess_1',
  is_special boolean DEFAULT false,
  special_label text,
  total_capacity integer DEFAULT 500,
  confirmed_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view menus"
  ON menus FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert menus"
  ON menus FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update menus"
  ON menus FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin')
    )
  );

-- Menu meals junction
CREATE TABLE IF NOT EXISTS menu_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id uuid NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  meal_id uuid NOT NULL REFERENCES meals(id) ON DELETE CASCADE
);

ALTER TABLE menu_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view menu meals"
  ON menu_meals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage menu meals"
  ON menu_meals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin')
    )
  );

-- Meal bookings
CREATE TABLE IF NOT EXISTS meal_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  menu_id uuid NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'consumed', 'no_show')),
  booked_at timestamptz DEFAULT now(),
  cancelled_at timestamptz,
  consumed_at timestamptz,
  qr_code text,
  is_emergency boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meal_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON meal_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON meal_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin', 'staff')
    )
  );

CREATE POLICY "Users can insert own bookings"
  ON meal_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON meal_bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update bookings"
  ON meal_bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin', 'staff')
    )
  );

-- Wallets
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0,
  emergency_credits integer NOT NULL DEFAULT 3,
  total_earned integer NOT NULL DEFAULT 0,
  total_spent integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet"
  ON wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets"
  ON wallets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin')
    )
  );

CREATE POLICY "Users can insert own wallet"
  ON wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update wallets"
  ON wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('mess_admin', 'super_admin')
  ))
  WITH CHECK (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('mess_admin', 'super_admin')
  ));

-- Wallet transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('credit', 'debit')),
  amount integer NOT NULL,
  reason text NOT NULL,
  reference_id uuid,
  balance_after integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON wallet_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON wallet_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON wallet_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin')
    )
  );

-- Complaints
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  category text NOT NULL CHECK (category IN ('food_quality', 'hygiene', 'service', 'quantity', 'other')),
  title text NOT NULL,
  description text NOT NULL,
  meal_type text,
  date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved', 'dismissed')),
  admin_response text,
  is_anonymous boolean DEFAULT true,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert complaints"
  ON complaints FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR is_anonymous = true);

CREATE POLICY "Users can view own complaints"
  ON complaints FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_anonymous = false);

CREATE POLICY "Admins can view all complaints"
  ON complaints FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update complaints"
  ON complaints FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin')
    )
  );

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'reminder')),
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Favourite meals
CREATE TABLE IF NOT EXISTS favourite_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  meal_id uuid NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, meal_id)
);

ALTER TABLE favourite_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favourites"
  ON favourite_meals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favourites"
  ON favourite_meals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favourites"
  ON favourite_meals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Penalty records
CREATE TABLE IF NOT EXISTS penalty_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES meal_bookings(id) ON DELETE SET NULL,
  reason text NOT NULL,
  month integer NOT NULL,
  year integer NOT NULL,
  penalty_amount integer DEFAULT 0,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE penalty_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own penalties"
  ON penalty_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all penalties"
  ON penalty_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert penalties"
  ON penalty_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin')
    )
  );

-- Waste reports
CREATE TABLE IF NOT EXISTS waste_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snacks', 'dinner')),
  confirmed_count integer DEFAULT 0,
  actual_consumed integer DEFAULT 0,
  wastage_kg decimal(5,2) DEFAULT 0,
  wastage_cost decimal(10,2) DEFAULT 0,
  mess_id text DEFAULT 'mess_1',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waste_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view waste reports"
  ON waste_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert waste reports"
  ON waste_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin')
    )
  );

-- Canteen items
CREATE TABLE IF NOT EXISTS canteen_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price integer NOT NULL,
  credit_price integer NOT NULL,
  description text,
  image_url text,
  is_veg boolean DEFAULT true,
  is_available boolean DEFAULT true,
  is_night_canteen boolean DEFAULT false,
  calories integer DEFAULT 0,
  rating decimal(2,1) DEFAULT 4.0,
  mess_id text DEFAULT 'mess_1',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE canteen_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view canteen items"
  ON canteen_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage canteen items"
  ON canteen_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin')
    )
  );

-- Canteen orders
CREATE TABLE IF NOT EXISTS canteen_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]',
  total_amount integer NOT NULL DEFAULT 0,
  payment_method text DEFAULT 'credits' CHECK (payment_method IN ('credits', 'cash', 'upi')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
  is_night_canteen boolean DEFAULT false,
  estimated_time integer DEFAULT 15,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE canteen_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own canteen orders"
  ON canteen_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert canteen orders"
  ON canteen_orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all canteen orders"
  ON canteen_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin', 'staff')
    )
  );

CREATE POLICY "Admins can update canteen orders"
  ON canteen_orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('mess_admin', 'super_admin', 'staff')
    )
  );
