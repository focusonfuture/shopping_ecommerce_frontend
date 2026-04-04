'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function HeroSection() {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[var(--bg)]">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 opacity-60 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-50 to-rose-50 opacity-60 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'radial-gradient(circle, #0a0a0f 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
      </div>

      <div className="container-shop relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-secondary)] font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                New Season Collection 2025
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-display text-5xl lg:text-6xl xl:text-7xl font-bold text-[var(--text-primary)] leading-[1.05] tracking-tight"
            >
              New Season,
              <br />
              <em className="not-italic" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                New Arrivals
              </em>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-[var(--text-secondary)] max-w-md leading-relaxed">
              Discover the latest trends in fashion, tech, and lifestyle. Curated for those who appreciate quality.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <Link href={`/${locale}/products`}
                className="btn-primary btn-lg group">
                Shop Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href={`/${locale}/categories`} className="btn-secondary btn-lg">
                Browse Categories
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-6 pt-4">
              {[
                { value: '50K+', label: 'Happy Customers' },
                { value: '10K+', label: 'Products' },
                { value: '4.9★', label: 'Avg Rating' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="font-display text-2xl font-bold text-[var(--text-primary)]">{value}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-xl ml-auto">
              {/* Main hero image */}
              <div className="absolute inset-8 rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] shadow-2xl">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center space-y-4 opacity-20">
                    <div className="w-24 h-24 mx-auto rounded-full bg-[var(--border)]" />
                    <div className="h-4 w-32 mx-auto rounded bg-[var(--border)]" />
                    <div className="h-3 w-24 mx-auto rounded bg-[var(--border)]" />
                  </div>
                </div>
                {/* Floating product cards */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-6 left-6 bg-[var(--surface)] rounded-2xl p-3 shadow-lg border border-[var(--border)]"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-lg">📱</div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-primary)]">iPhone 15 Pro</p>
                      <p className="text-xs text-[var(--text-tertiary)]">₹1,34,900</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute bottom-8 right-6 bg-[var(--surface)] rounded-2xl p-3 shadow-lg border border-[var(--border)]"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white text-lg">🎧</div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-primary)]">Sony XM5</p>
                      <p className="text-xs text-green-600 font-medium">14% off</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute bottom-24 left-4 bg-[var(--surface)] rounded-2xl p-3 shadow-lg border border-[var(--border)]"
                >
                  <p className="text-xs font-semibold text-green-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Free Shipping
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">On orders above ₹999</p>
                </motion.div>
              </div>

              {/* Background circles */}
              <div className="absolute -top-4 -right-4 w-64 h-64 rounded-full bg-indigo-100 opacity-50 -z-10" />
              <div className="absolute -bottom-4 -left-4 w-48 h-48 rounded-full bg-amber-100 opacity-50 -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
