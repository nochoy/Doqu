"use client"

import Link from "next/link"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import GoogleLoginButton from "./google-login"
import { Button } from "../ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { SignupFormInput, SignupFormSchema } from "@/types/auth"
import { zodResolver } from "@hookform/resolvers/zod"

export default function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormInput>({
    resolver: zodResolver(SignupFormSchema),
  });

  const onSubmit = async (data: SignupFormInput) => {
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if(!response.ok) {
        throw new Error(result.detail || "An error occured");
      }

      // TODO: auto login
      router.push("/");
    } catch (err) {
      console.log('error: ', err);
      setError(err instanceof Error ? err.message : "An error occured");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Welcome to Doqu!</CardTitle>
          <CardDescription>
            Create your Doqu account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* Email Input */}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="molly@doqu.com"
                  {...register("email")}
                />
              </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}

              {/* Username Input */}
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Molly"
                  {...register("username")}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}

              {/* Password Input */}
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input 
                  id="password" 
                  type="password"  
                  {...register("password")}
                />
              </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}

              {/* Confirm Password Input */}
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                </div>
                <Input id="confirm-password" type="password" required />
              </div>

              {/* Backend Errors */}
              {error && (
                <div className="text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Loading..." : "Register"}
              </Button>
              {/* Google Login Button */}
              <GoogleLoginButton disabled={isSubmitting}/>
            </div>

            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="login" className="underline underline-offset-4">
                Log in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
