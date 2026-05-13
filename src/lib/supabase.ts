import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';
export type UserRole = 'student' | 'mess_admin' | 'super_admin' | 'staff';
export type BookingStatus = 'confirmed' | 'cancelled' | 'consumed' | 'no_show';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  student_id?: string;
  hostel_name?: string;
  room_number?: string;
  phone?: string;
  avatar_url?: string;
  diet_preference: 'veg' | 'non_veg' | 'both';
  mess_id: string;
  is_active: boolean;
  created_at: string;
}

export interface Meal {
  id: string;
  name: string;
  meal_type: MealType;
  description: string;
  is_veg: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  allergens: string[];
  is_spicy: boolean;
  image_url?: string;
  popularity_score: number;
}

export interface Menu {
  id: string;
  date: string;
  meal_type: MealType;
  serving_time: string;
  cutoff_time: string;
  mess_id: string;
  is_special: boolean;
  special_label?: string;
  total_capacity: number;
  confirmed_count: number;
  meals?: Meal[];
}

export interface MealBooking1 {
  id: string;
  user_id: string;
  menu_id: string;
  status: BookingStatus;
  booked_at: string;
  cancelled_at?: string;
  consumed_at?: string;
  qr_code?: string;
  is_emergency: boolean;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  emergency_credits: number;
  total_earned: number;
  total_spent: number;
  streak_days: number;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  balance_after: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'reminder';
  is_read: boolean;
  created_at: string;
}

export interface Complaint {
  id: string;
  user_id?: string;
  category: string;
  title: string;
  description: string;
  meal_type?: string;
  date: string;
  status: 'pending' | 'in_review' | 'resolved' | 'dismissed';
  admin_response?: string;
  is_anonymous: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

export interface CanteenItem {
  id: string;
  name: string;
  category: string;
  price: number;
  credit_price: number;
  description?: string;
  image_url?: string;
  is_veg: boolean;
  is_available: boolean;
  is_night_canteen: boolean;
  calories: number;
  rating: number;
}

export const CREDIT_VALUES: Record<MealType, number> = {
  breakfast: 5,
  lunch: 15,
  snacks: 2,
  dinner: 20  ,
};
