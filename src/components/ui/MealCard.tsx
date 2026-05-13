import { motion } from 'framer-motion';
import { Flame, Leaf, AlertCircle, Clock, Check, X, Zap } from 'lucide-react';
import { Menu, Meal, MealBooking, CREDIT_VALUES } from '../../lib/supabase';

interface MealCardProps {
  menu: Menu;
  meals: Meal[];
  booking?: MealBooking;
  onBook: (menuId: string) => void;
  onCancel: (bookingId: string, menuId: string) => void;
  loading?: boolean;
}

const mealColors = {
  breakfast: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
  lunch: 'from-emerald-500/20 to-green-500/10 border-emerald-500/30',
  snacks: 'from-blue-500/20 to-sky-500/10 border-blue-500/30',
  dinner: 'from-violet-500/20 to-purple-500/10 border-violet-500/30',
};

const mealIcons = {
  breakfast: '🌅',
  lunch: '☀️',
  snacks: '🫙',
  dinner: '🌙',
};

const mealTextColor = {
  breakfast: 'text-amber-400',
  lunch: 'text-emerald-400',
  snacks: 'text-blue-400',
  dinner: 'text-violet-400',
};

export default function MealCard({ menu, meals, booking, onBook, onCancel, loading }: MealCardProps) {
  const now = new Date();
  const cutoff = new Date(menu.cutoff_time);
  const isPastCutoff = now > cutoff;
  const isBooked = booking?.status === 'confirmed';
  const isCancelled = booking?.status === 'cancelled';
  const credits = CREDIT_VALUES[menu.meal_type];

  const minutesLeft = Math.max(0, Math.floor((cutoff.getTime() - now.getTime()) / 60000));
  const hoursLeft = Math.floor(minutesLeft / 60);
  const minsLeft = minutesLeft % 60;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className={`bg-gradient-to-br ${mealColors[menu.meal_type]} border rounded-2xl p-5 relative overflow-hidden`}
    >
      {isBooked && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium px-2 py-1 rounded-full">
          <Check className="w-3 h-3" /> Booked
        </div>
      )}
      {isCancelled && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium px-2 py-1 rounded-full">
          <X className="w-3 h-3" /> Cancelled
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{mealIcons[menu.meal_type]}</span>
        <div>
          <h3 className={`font-bold text-lg capitalize ${mealTextColor[menu.meal_type]}`}>{menu.meal_type}</h3>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Clock className="w-3 h-3" />
            <span>{menu.serving_time}</span>
          </div>
        </div>
      </div>

      {!isPastCutoff && minutesLeft < 180 && (
        <div className="mb-3 flex items-center gap-1.5 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
          <Zap className="w-3 h-3" />
          Booking closes in {hoursLeft > 0 ? `${hoursLeft}h ` : ''}{minsLeft}m
        </div>
      )}

      <div className="space-y-2 mb-4">
        {meals.slice(0, 4).map(meal => (
          <div key={meal.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${meal.is_veg ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-gray-200 text-sm">{meal.name}</span>
              {meal.is_spicy && <Flame className="w-3 h-3 text-orange-400" />}
              {!meal.allergens.length || meal.allergens.length === 0 ? null : (
                <AlertCircle className="w-3 h-3 text-amber-400" title={meal.allergens.join(', ')} />
              )}
            </div>
            <span className="text-gray-500 text-xs">{meal.calories} cal</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Leaf className="w-3 h-3 text-emerald-500" />
          <span>{menu.confirmed_count} confirmed</span>
        </div>
        <span className="text-emerald-400 font-medium">+{credits} credits if cancelled</span>
      </div>

      {!isPastCutoff && !isCancelled && (
        isBooked ? (
          <button
            onClick={() => booking && onCancel(booking.id, menu.id)}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            Cancel & Earn {credits} Credits
          </button>
        ) : (
          <button
            onClick={() => onBook(menu.id)}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            Confirm Meal
          </button>
        )
      )}

      {isPastCutoff && !isBooked && (
        <div className="w-full py-2.5 rounded-xl bg-gray-700/50 text-gray-500 text-sm text-center">
          Booking Closed
        </div>
      )}
    </motion.div>
  );
}
