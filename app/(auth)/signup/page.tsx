'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useUserStore } from '@/store/userStore';

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setUser(email.trim(), name.trim() || undefined);
    router.push('/assessment');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1 text-2xl font-black">
            <span className="text-purple-700">She</span>
            <span className="text-gray-900">Starts</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h1 className="text-2xl font-black text-gray-900 mb-1">Start your journey</h1>
          <p className="text-gray-500 text-sm mb-6">Create your free account in seconds</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 placeholder:text-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="priya@example.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 placeholder:text-gray-400" />
            </div>
            <button type="submit" className="w-full rounded-xl bg-purple-700 px-6 py-3.5 font-bold text-white shadow-lg hover:bg-purple-800 transition-colors">
              Create Free Account →
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
