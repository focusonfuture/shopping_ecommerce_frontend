'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Mail } from 'lucide-react';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.requestPasswordReset(email);
      setSent(true);
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-[var(--bg-secondary)]">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-md">
        <div className="card p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[var(--text-inverse)]" />
            </div>
            <span className="font-display text-xl font-semibold">ShopElite</span>
          </div>
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600"/>
              </div>
              <h2 className="font-display text-xl font-bold mb-2">Check your email</h2>
              <p className="text-[var(--text-secondary)] text-sm mb-6">If that email exists, we've sent a password reset link.</p>
              <Link href={`/${locale}/login`} className="btn-primary">Back to Login</Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-1">Forgot Password?</h1>
              <p className="text-[var(--text-secondary)] text-sm mb-6">Enter your email and we'll send a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="label">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input" required /></div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <Link href={`/${locale}/login`} className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mt-4 transition-colors">
                <ArrowLeft className="w-4 h-4"/> Back to Login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
