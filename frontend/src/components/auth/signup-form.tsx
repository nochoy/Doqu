'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GoogleLoginButton from './google-login';
import { Button } from '../ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { SignupFormInput, SignupFormSchema } from '@/types/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';

export default function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormInput>({
    resolver: zodResolver(SignupFormSchema),
  });

  const onSubmit = async (data: SignupFormInput) => {
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'An error occurred');
      }

      localStorage.setItem('access_token', result.access_token);
      router.push('/');
    } catch (err) {
      console.log('error: ', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Welcome to Doqu!</CardTitle>
          <CardDescription>Create your Doqu account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-6">
              {/* Email Input */}
              <div className="grid gap-3">
                <Label htmlFor="email">
                  Email<span className="text-sm text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="molly@doqu.com"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive -mt-5 ml-3">{errors.email.message}</p>
              )}

              {/* Username Input */}
              <div className="grid gap-3">
                <Label htmlFor="username">
                  Username<span className="text-sm text-destructive">*</span>
                </Label>
                <Input id="username" placeholder="Molly" maxLength={20} {...register('username')} />
              </div>
              {errors.username && (
                <p className="text-sm text-destructive -mt-5 ml-3">{errors.username.message}</p>
              )}

              {/* Password Input */}
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">
                    Password<span className="text-sm text-destructive">*</span>
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className="pr-10"
                  />

                  {/* Show Password Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3"
                  >
                    {showPassword ? <EyeSlashIcon weight="light" /> : <EyeIcon weight="light" />}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive -mt-5 ml-3">{errors.password.message}</p>
              )}

              {/* Backend Errors */}
              {error && <div className="text-sm text-destructive">{error}</div>}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Loading...' : 'Register'}
              </Button>
              {/* Google Login Button */}
              <GoogleLoginButton disabled={isSubmitting} />
            </div>

            {/* Switch to Login page */}
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="login" className="underline underline-offset-4">
                Log in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
