/**
 * Registration Page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import type { RegisterRequest } from '@momentum/shared';
import { authAPI } from '@/lib/api';
import { useMomentumStore } from '@/lib/store';
import Button from '@/app/components/Button';
import Input from '@/app/components/Input';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useMomentumStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>();

  const onSubmit = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await authAPI.register({ ...data, timezone });
      setUser(response.user);
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <span className="text-3xl font-bold text-primary-900">Momentum</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Start Your Free Trial</h1>
          <p className="text-gray-600">7 days free, no credit card required</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
              })}
              type="text"
              label="Full Name"
              placeholder="John Doe"
              error={errors.name?.message}
              fullWidth
            />

            <Input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address',
                },
              })}
              type="email"
              label="Email"
              placeholder="you@example.com"
              error={errors.email?.message}
              fullWidth
            />

            <Input
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
              type="password"
              label="Password"
              placeholder="••••••••"
              error={errors.password?.message}
              helperText="Minimum 8 characters"
              fullWidth
            />

            <Button type="submit" isLoading={isLoading} fullWidth>
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-900 font-medium hover:text-primary-700">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
