import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import {
  UtensilsCrossed, BarChart3, Leaf, Bell, Shield, Zap,
  Star, ArrowRight, CheckCircle, ChevronDown, Wallet, Users, TrendingDown
} from 'lucide-react';

const stats = [
  { label: 'Food Waste Reduced', value: '68%', icon: TrendingDown, color: 'text-emerald-400' },
  { label: 'Students Served Daily', value: '12,000+', icon: Users, color: 'text-blue-400' },
  { label: 'Colleges Onboarded', value: '48', icon: Shield, color: 'text-amber-400' },
  { label: 'Credits Distributed', value: '2.4M', icon: Wallet, color: 'text-rose-400' },
];

const features = [
  {
    icon: UtensilsCrossed, title: 'Smart Meal Booking',
    desc: 'Confirm or cancel meals hours before preparation. Prevents over-cooking and reduces wastage.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: BarChart3, title: 'AI Demand Prediction',
    desc: 'Machine-learning algorithms forecast daily meal attendance with 94% accuracy.',
    color: 'from-blue-500 to-sky-600',
  },
  {
    icon: Wallet, title: 'Meal Credit System',
    desc: 'Earn credits for cancelled meals. Spend at canteens, night canteens, and special events.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Bell, title: 'Smart Notifications',
    desc: 'Personalized reminders for favourite foods, booking deadlines, and special menus.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Leaf, title: 'Sustainability Tracker',
    desc: 'Track your environmental impact. See how much food waste you personally helped prevent.',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: Shield, title: 'QR Meal Verification',
    desc: 'Unique QR codes prevent duplicate entries and ensure accurate consumption tracking.',
    color: 'from-rose-500 to-red-600',
  },
];

const testimonials = [
  { name: 'Arjun Sharma', role: 'Student, IIT Delhi', text: 'MessMind completely changed how I manage my meals. The credit system is genius — I save food and earn rewards!', rating: 5 },
  { name: 'Priya Mehta', role: 'Mess Admin, NIT Trichy', text: 'Our food wastage dropped 60% in the first month. The AI demand predictions are incredibly accurate.', rating: 5 },
  { name: 'Dr. Ramesh Kumar', role: 'Dean, BITS Pilani', text: 'The analytics dashboard gives us insight we never had before. A must-have for every university.', rating: 5 },
];

const faqs = [
  { q: 'How does the meal credit system work?', a: 'When you cancel a meal before the cutoff time (2-3 hours before serving), you earn credits: 10 for breakfast, 25 for lunch, 8 for snacks, and 30 for dinner. These credits can be used at the canteen, night canteen, or for emergency meal bookings.' },
  { q: 'What happens if I miss a booked meal?', a: 'If you book a meal but do not show up, it counts as a "no-show." After 5 no-shows in a month, restrictions or fines are applied to discourage food waste.' },
  { q: 'Can I use emergency credits?', a: 'Yes! Each student gets 3 emergency credits per month for late meal bookings after the cutoff. Use them wisely!' },
  { q: 'How accurate is the AI prediction?', a: 'Our AI model analyzes historical booking patterns, events, and weather data to predict meal demand with up to 94% accuracy, significantly reducing over-preparation.' },
  { q: 'Is my data secure?', a: 'All data is encrypted and stored securely. Anonymous complaint reporting ensures your privacy. We comply with all data protection regulations.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">MessMind <span className="text-emerald-400">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#stats" className="hover:text-white transition-colors">Impact</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2">
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="text-sm bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div style={{ y }} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-2 rounded-full mb-6"
          >
            <Zap className="w-4 h-4" />
            AI-Powered Smart Hostel Management
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-6 leading-tight"
          >
            Eliminate Hostel
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Food Waste
            </span>
            <br />
            with AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            MessMind AI gives students smart meal booking, real-time credits, and personalized recommendations — while giving admins powerful analytics to cut waste by up to 68%.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-2xl text-base font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-500/25"
            >
              Start for Free <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 px-8 py-3.5 rounded-2xl text-base font-medium transition-colors"
            >
              Sign In
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-16 flex justify-center"
          >
            <a href="#stats" className="text-gray-500 hover:text-gray-300 transition-colors animate-bounce">
              <ChevronDown className="w-6 h-6" />
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 bg-gray-900 border border-gray-800 rounded-2xl"
            >
              <Icon className={`w-8 h-8 mx-auto mb-3 ${color}`} />
              <p className={`text-3xl font-black mb-1 ${color}`}>{value}</p>
              <p className="text-gray-500 text-sm">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4">Everything you need</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A complete ecosystem for smarter, sustainable hostel mess management
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4">How it works</h2>
            <p className="text-gray-400 text-lg">Simple for students, powerful for admins</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'View Today\'s Menu', desc: 'See all 4 meals with full nutrition info, allergens, and availability.' },
              { step: '02', title: 'Confirm or Cancel', desc: 'Opt-in for meals you\'ll eat. Cancel before cutoff to earn meal credits.' },
              { step: '03', title: 'Scan QR at Mess', desc: 'Use your unique QR code to verify attendance and mark meal as consumed.' },
            ].map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 text-2xl font-black text-white">
                  {step}
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4">Loved by students & admins</h2>
            <p className="text-gray-400 text-lg">Real results from real campuses</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, rating }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">"{text}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{name}</p>
                  <p className="text-gray-500 text-xs">{role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4">Frequently asked</h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map(({ q, a }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold mb-2">{q}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Ready to cut waste?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Join thousands of students and admins building a more sustainable campus.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-105 shadow-lg shadow-emerald-500/25 mx-auto"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">MessMind AI</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 MessMind AI. Building sustainable campuses.</p>
          <div className="flex gap-6 text-gray-500 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
