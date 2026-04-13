'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().min(1, 'Last name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data);
      toast.success('Account created! Please verify your email.');
      router.push(`/${locale}`);
    } catch (e: any) {
      const msg = e.response?.data;
      toast.error(typeof msg === 'object' ? Object.values(msg).flat().join(' ') : 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-[var(--bg-secondary)]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[var(--text-inverse)]" />
            </div>
            <span className="font-display text-xl font-semibold">ShopElite</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-1">Create Account</h1>
          <p className="text-[var(--text-secondary)] text-sm mb-6">
            Already have an account?{' '}
            <Link href={`/${locale}/login`} className="text-[var(--accent)] font-medium hover:underline">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name</label>
                <input {...register('first_name')} placeholder="John" className="input" />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="label">Last Name</label>
                <input {...register('last_name')} placeholder="Doe" className="input" />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
              </div>
            </div>
            <div>
              <label className="label">Email Address</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className="input" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" className="input pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input {...register('confirm_password')} type="password" placeholder="Repeat password" className="input" />
              {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3.5 text-base mt-2">
              {isLoading ? 'Creating account...' : 'Create Account'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-xs text-[var(--text-tertiary)] text-center mt-4">
            By creating an account you agree to our{' '}
            <Link href={`/${locale}/pages/terms`} className="underline">Terms</Link> and{' '}
            <Link href={`/${locale}/pages/privacy-policy`} className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
