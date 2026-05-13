/*
  # Seed Data for MessMind AI

  1. Insert sample meals across all meal types
  2. Insert sample canteen items
  3. Insert today's menus
*/

-- Sample meals
INSERT INTO meals (id, name, meal_type, description, is_veg, calories, protein, carbs, fat, allergens, is_spicy, popularity_score)
VALUES
  -- Breakfast items
  (gen_random_uuid(), 'Idli Sambar', 'breakfast', 'Soft steamed rice cakes with lentil soup', true, 250, 8, 45, 3, '{}', false, 85),
  (gen_random_uuid(), 'Masala Dosa', 'breakfast', 'Crispy crepe with spiced potato filling', true, 320, 7, 55, 8, '{}', true, 92),
  (gen_random_uuid(), 'Poha', 'breakfast', 'Flattened rice with onions and spices', true, 200, 5, 38, 4, '{}', false, 78),
  (gen_random_uuid(), 'Bread Omelette', 'breakfast', 'Toasted bread with egg omelette', false, 380, 18, 28, 16, ARRAY['eggs', 'gluten'], false, 88),
  (gen_random_uuid(), 'Upma', 'breakfast', 'Semolina porridge with vegetables', true, 220, 6, 40, 5, ARRAY['gluten'], false, 72),
  -- Lunch items
  (gen_random_uuid(), 'Dal Tadka', 'lunch', 'Yellow lentils with cumin tempering', true, 180, 10, 25, 5, '{}', false, 80),
  (gen_random_uuid(), 'Paneer Butter Masala', 'lunch', 'Cottage cheese in rich tomato gravy', true, 420, 18, 28, 28, ARRAY['dairy'], false, 95),
  (gen_random_uuid(), 'Chicken Curry', 'lunch', 'Spiced chicken in onion tomato gravy', false, 380, 32, 15, 20, '{}', true, 91),
  (gen_random_uuid(), 'Jeera Rice', 'lunch', 'Basmati rice tempered with cumin', true, 280, 5, 58, 4, '{}', false, 82),
  (gen_random_uuid(), 'Chapati', 'lunch', 'Whole wheat flatbread', true, 120, 4, 22, 2, ARRAY['gluten'], false, 88),
  -- Snacks items
  (gen_random_uuid(), 'Samosa', 'snacks', 'Crispy pastry with spiced potato filling', true, 180, 4, 24, 8, ARRAY['gluten'], true, 94),
  (gen_random_uuid(), 'Vada Pav', 'snacks', 'Mumbai street food with potato fritter', true, 280, 6, 42, 10, ARRAY['gluten'], true, 96),
  (gen_random_uuid(), 'Tea / Coffee', 'snacks', 'Hot beverages', true, 60, 2, 8, 2, ARRAY['dairy'], false, 90),
  (gen_random_uuid(), 'Biscuits', 'snacks', 'Assorted biscuits', true, 120, 2, 20, 4, ARRAY['gluten', 'dairy'], false, 75),
  -- Dinner items
  (gen_random_uuid(), 'Rajma Chawal', 'dinner', 'Kidney beans curry with rice', true, 380, 15, 65, 6, '{}', false, 89),
  (gen_random_uuid(), 'Palak Paneer', 'dinner', 'Spinach and cottage cheese curry', true, 340, 16, 20, 22, ARRAY['dairy'], false, 87),
  (gen_random_uuid(), 'Mutton Biryani', 'dinner', 'Aromatic spiced rice with mutton', false, 520, 28, 62, 16, '{}', true, 98),
  (gen_random_uuid(), 'Curd Rice', 'dinner', 'Cooked rice mixed with yogurt', true, 260, 8, 45, 5, ARRAY['dairy'], false, 76),
  (gen_random_uuid(), 'Roti Sabzi', 'dinner', 'Whole wheat flatbread with mixed vegetables', true, 300, 9, 48, 7, ARRAY['gluten'], false, 83);

-- Sample canteen items
INSERT INTO canteen_items (name, category, price, credit_price, description, is_veg, is_available, is_night_canteen, calories, rating)
VALUES
  ('Maggi Noodles', 'noodles', 30, 35, 'Classic instant noodles', true, true, true, 320, 4.5),
  ('Egg Maggi', 'noodles', 40, 45, 'Instant noodles with egg', false, true, true, 400, 4.6),
  ('Bread Omelette', 'sandwiches', 35, 40, 'Toasted bread with egg', false, true, false, 380, 4.4),
  ('Veg Sandwich', 'sandwiches', 30, 35, 'Fresh vegetables in bread', true, true, false, 280, 4.2),
  ('Cold Coffee', 'beverages', 40, 45, 'Blended cold coffee', true, true, true, 180, 4.7),
  ('Masala Chai', 'beverages', 15, 18, 'Spiced tea', true, true, true, 80, 4.8),
  ('Banana Milkshake', 'beverages', 50, 55, 'Fresh banana blended with milk', true, true, false, 220, 4.5),
  ('Chocolate Donuts', 'snacks', 25, 30, 'Soft glazed donuts', true, true, true, 250, 4.3),
  ('French Fries', 'snacks', 40, 45, 'Crispy potato fries', true, true, true, 320, 4.6),
  ('Paneer Roll', 'rolls', 60, 70, 'Spiced paneer in wrap', true, true, false, 420, 4.5),
  ('Chicken Roll', 'rolls', 70, 80, 'Grilled chicken in wrap', false, true, false, 480, 4.7),
  ('Coke / Pepsi', 'beverages', 30, 35, 'Chilled soft drinks', true, true, true, 150, 4.0),
  ('Butter Milk', 'beverages', 20, 25, 'Chilled spiced buttermilk', true, true, false, 60, 4.4),
  ('Aloo Paratha', 'mains', 45, 50, 'Stuffed potato flatbread', true, true, false, 380, 4.6),
  ('Dal Makhani', 'mains', 55, 65, 'Creamy black lentils', true, true, false, 350, 4.8);

-- Insert today's menus
DO $$
DECLARE
  today date := CURRENT_DATE;
  breakfast_id uuid;
  lunch_id uuid;
  snacks_id uuid;
  dinner_id uuid;
  meal_rec RECORD;
BEGIN
  -- Create menus for today
  INSERT INTO menus (id, date, meal_type, serving_time, cutoff_time, confirmed_count)
  VALUES
    (gen_random_uuid(), today, 'breakfast', '7:30 AM - 9:00 AM', (today + TIME '05:30:00')::timestamptz, 320),
    (gen_random_uuid(), today, 'lunch', '12:30 PM - 2:00 PM', (today + TIME '10:00:00')::timestamptz, 410),
    (gen_random_uuid(), today, 'snacks', '5:00 PM - 6:00 PM', (today + TIME '14:30:00')::timestamptz, 280),
    (gen_random_uuid(), today, 'dinner', '7:30 PM - 9:00 PM', (today + TIME '17:00:00')::timestamptz, 390)
  ON CONFLICT DO NOTHING;

  -- Link breakfast meals
  SELECT id INTO breakfast_id FROM menus WHERE date = today AND meal_type = 'breakfast' LIMIT 1;
  SELECT id INTO lunch_id FROM menus WHERE date = today AND meal_type = 'lunch' LIMIT 1;
  SELECT id INTO snacks_id FROM menus WHERE date = today AND meal_type = 'snacks' LIMIT 1;
  SELECT id INTO dinner_id FROM menus WHERE date = today AND meal_type = 'dinner' LIMIT 1;

  IF breakfast_id IS NOT NULL THEN
    INSERT INTO menu_meals (menu_id, meal_id)
    SELECT breakfast_id, id FROM meals WHERE meal_type = 'breakfast' LIMIT 3
    ON CONFLICT DO NOTHING;
  END IF;

  IF lunch_id IS NOT NULL THEN
    INSERT INTO menu_meals (menu_id, meal_id)
    SELECT lunch_id, id FROM meals WHERE meal_type = 'lunch' LIMIT 4
    ON CONFLICT DO NOTHING;
  END IF;

  IF snacks_id IS NOT NULL THEN
    INSERT INTO menu_meals (menu_id, meal_id)
    SELECT snacks_id, id FROM meals WHERE meal_type = 'snacks' LIMIT 3
    ON CONFLICT DO NOTHING;
  END IF;

  IF dinner_id IS NOT NULL THEN
    INSERT INTO menu_meals (menu_id, meal_id)
    SELECT dinner_id, id FROM meals WHERE meal_type = 'dinner' LIMIT 4
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert menus for next 6 days
  FOR i IN 1..6 LOOP
    INSERT INTO menus (id, date, meal_type, serving_time, cutoff_time, confirmed_count)
    VALUES
      (gen_random_uuid(), today + i, 'breakfast', '7:30 AM - 9:00 AM', (today + i + TIME '05:30:00')::timestamptz, 300 + (random() * 100)::int),
      (gen_random_uuid(), today + i, 'lunch', '12:30 PM - 2:00 PM', (today + i + TIME '10:00:00')::timestamptz, 380 + (random() * 80)::int),
      (gen_random_uuid(), today + i, 'snacks', '5:00 PM - 6:00 PM', (today + i + TIME '14:30:00')::timestamptz, 250 + (random() * 90)::int),
      (gen_random_uuid(), today + i, 'dinner', '7:30 PM - 9:00 PM', (today + i + TIME '17:00:00')::timestamptz, 360 + (random() * 100)::int)
    ON CONFLICT DO NOTHING;
  END LOOP;

END $$;
