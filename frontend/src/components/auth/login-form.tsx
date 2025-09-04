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
import { LoginFormInput, LoginFormSchema } from "@/types/auth"
import { zodResolver } from "@hookform/resolvers/zod"

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInput>({
    resolver: zodResolver(LoginFormSchema),
  });

  const onSubmit = async (data: LoginFormInput) => {
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
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

      localStorage.setItem("access_token", result.access_token);
      router.push("/");
    } catch (err) {
      console.log('error: ', err);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }
  

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Welcome back!</CardTitle>
          <CardDescription>
            Login to your Doqu account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* Email Input */}
              <div className="grid gap-3">
                <Label htmlFor="email" >
                  Email <span className="text-sm text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="molly@doqu.com"
                  {...register("email")}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-destructive -mt-5 ml-3">{errors.email.message}</p>
                )}
              </div>
              {/* Password Input */}
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">
                    Password <span className="text-sm text-destructive">*</span>
                  </Label>
                  {/* <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link> */}
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  {...register("password")}
                  disabled={isSubmitting}
                />
                {errors.password && (
                  <p className="text-sm text-destructive -mt-5 ml-3">{errors.password.message}</p>
                )}
              </div>

              {/* Backend Errors */}
              {error && (
                <div className="text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Loading..." : "Login"}
              </Button>
              {/* Google Login Button */}
              <GoogleLoginButton disabled={isSubmitting}/>
            </div>
            {/* Switch to sign up page */}
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="signup" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
