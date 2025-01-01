"use client";

import { BrandMark } from "@/components/brand-mark";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { handleFirstLogin } from "@/lib/automated-email-service";
import { useDemoLogin } from "@/hooks/use-demo-login";
import { AnimatedCharacters } from "@/components/ui/animated-characters";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { toPublicProfile } from "@/lib/public-profile";
import { syncAdminRole } from "./actions";
import { getErrorMessage } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const demo = useDemoLogin();
  const demoLoading = demo.pending;
  const handleDemoLogin = async (role: "employee" | "employer") => {
    setError("");
    try {
      await demo.start(role);
    } catch (err) {
      setError(getErrorMessage(err) || "Could not start the demo.");
      toast({ title: "Demo unavailable", description: getErrorMessage(err), variant: "destructive" });
    }
  };

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const password = form.watch("password");

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      // Handle first login automation
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        await setDoc(
          doc(db, "publicProfiles", user.uid),
          toPublicProfile({ uid: user.uid, ...userData }),
          { merge: true },
        );
        await handleFirstLogin(
          user.uid,
          user.email!,
          userData.displayName || user.email!,
        );
      }

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if ((await syncAdminRole(await user.getIdToken())) || userData.role === "admin") {
          router.push("/admin");
        } else if (userData.role === "employer") {
          router.push("/employer/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(getErrorMessage(err) || "Invalid email or password. Please try again.");
      toast({
        title: "Login Failed",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // New Google user: they choose seeker vs employer during onboarding.
        router.push("/onboarding");
      } else {
        // Existing user logic
        await setDoc(
          doc(db, "publicProfiles", user.uid),
          toPublicProfile({ uid: user.uid, ...userDocSnap.data() }),
          { merge: true },
        );
        const userData = userDocSnap.data();
        if ((await syncAdminRole(await user.getIdToken())) || userData.role === "admin") {
          router.push("/admin");
        } else if (userData.role === "employer") {
          router.push("/employer/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      toast({
        title: "Google Sign-In Failed",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen max-h-screen overflow-hidden grid lg:grid-cols-2">
      {/* Left Content Section with Animated Characters */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[hsl(20_22%_14%)] p-12 text-[hsl(36_35%_92%)]">
        <div className="relative z-20">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <BrandMark className="h-8 w-8" />
            <span>Career Wise</span>
          </Link>
        </div>

        <div className="relative z-20 flex items-end justify-center h-[500px]">
          <AnimatedCharacters
            isTyping={isTyping}
            showPassword={showPassword}
            passwordLength={password.length}
          />
        </div>

        <div className="relative z-20 flex items-center gap-8 text-sm text-white/70">
          <a
            href="/privacy-policy"
            className="hover:text-white transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="hover:text-white transition-colors"
          >
            Terms of Service
          </a>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      </div>

      {/* Right Login Section */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12">
            <BrandMark className="h-8 w-8" />
            <span>Career Wise</span>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Welcome back!
            </h1>
            <p className="text-muted-foreground text-sm">
              Please enter your details
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="off"
                {...form.register("email")}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                className="h-12 bg-background border-border/60 focus:border-primary"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...form.register("password")}
                  className="h-12 pr-10 bg-background border-border/60 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember for 30 days
                </Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg">
                {error}
              </div>
            )}

            <InteractiveHoverButton
              type="submit"
              text={isLoading ? "Signing in..." : "Log in"}
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            />
          </form>

          {/* Guest demo */}
          <div className="mt-6 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
            <p className="text-sm font-medium text-foreground">Just looking around?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Explore with a sample account full of jobs, applications and messages. No sign-up needed.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                type="button"
                className="h-10"
                disabled={demoLoading !== null}
                onClick={() => handleDemoLogin("employee")}
              >
                {demoLoading === "employee" ? "Preparing demo..." : "Try demo as job seeker"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10"
                disabled={demoLoading !== null}
                onClick={() => handleDemoLogin("employer")}
              >
                {demoLoading === "employer" ? "Preparing demo..." : "Try demo as employer"}
              </Button>
            </div>
          </div>

          {/* Social Login */}
          <div className="mt-6">
            <InteractiveHoverButton
              type="button"
              text="Log in with Google"
              className="w-full h-12 border-border/60"
              onClick={handleGoogleSignIn}
              icon={
                <svg
                  className="h-5 w-5"
                  aria-hidden="true"
                  focusable="false"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 76.2C322.3 113.2 289.4 96 248 96c-88.8 0-160.1 71.9-160.1 160.1s71.3 160.1 160.1 160.1c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"
                  ></path>
                </svg>
              }
            />
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-muted-foreground mt-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-foreground font-medium hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
