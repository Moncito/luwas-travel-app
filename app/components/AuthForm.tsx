"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth } from "@/firebase/client";
import { db } from "@/lib/firebase";
import { signUp, signIn, setSessionCookie } from "@/lib/actions/auth.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

// ------------------- TYPES & SCHEMA -------------------
type FormType = "sign-in" | "sign-up";

const authFormSchema = (type: FormType) =>
  z.object({
    name:
      type === "sign-up"
        ? z.string().min(3, "Name must be at least 3 characters")
        : z.string().optional(),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

// ------------------- COMPONENT -------------------
const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const isSignIn = type === "sign-in";
  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  // ------------------- HANDLERS -------------------

  const handleForgotPassword = async (email: string) => {
    if (!email) return toast.error("Please enter your email first.");
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent successfully!");
    } catch {
      toast.error("Failed to send reset email. Try again later.");
    }
  };

  // ✅ Shared Firestore user creation logic
  const ensureUserInFirestore = async (user: any, provider: string) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || "Traveler",
          email: user.email,
          photoURL: user.photoURL || null,
          provider,
          createdAt: serverTimestamp(),
        });
        console.log("✅ Firestore user created:", user.email);
      } else {
        console.log("🔁 Firestore user already exists:", user.email);
      }
    } catch (err) {
      console.error("🔥 Firestore sync failed:", err);
    }
  };

  // 🟦 Google Login
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      await ensureUserInFirestore(user, "google");
      await setSessionCookie(idToken);

      toast.success(`Welcome ${user.displayName || "Traveler"}! 🌍`);
      router.push("/");
    } catch (error) {
      toast.error("Google login failed. Please try again.");
      console.error("Google Login Error:", error);
    }
  };

  // 🟦 Facebook Login
  const handleFacebookLogin = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      await ensureUserInFirestore(user, "facebook");
      await setSessionCookie(idToken);

      toast.success(`Welcome ${user.displayName || "Traveler"}! 🌴`);
      router.push("/");
    } catch (error) {
      toast.error("Facebook login failed.");
      console.error("Facebook Login Error:", error);
    }
  };

  // 📨 Email Sign In / Sign Up
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { name, email, password } = values;

    try {
      if (!isSignIn) {
        // --- SIGN UP ---
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;
        const idToken = await user.getIdToken();

        await signUp({ uid: user.uid, name: name!, email });
        await ensureUserInFirestore(user, "email");
        await setSessionCookie(idToken);

        toast.success("Account created successfully!");
        router.push("/");
      } else {
        // --- SIGN IN ---
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCred.user.getIdToken();

        await signIn({ email, idToken });
        await ensureUserInFirestore(userCred.user, "email");

        toast.success("Welcome back to LUWAS! 🌊");
        router.push("/");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      switch (error.code) {
        case "auth/email-already-in-use":
          toast.error("This email is already registered.");
          break;
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          toast.error("Invalid email or password.");
          break;
        default:
          toast.error("Something went wrong. Please try again later.");
      }
    }
  };

  // ------------------- UI -------------------
  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="text-center mb-2">
        <h2 className="text-2xl font-[var(--font-playfair)] text-white font-bold tracking-wide">
          {isSignIn ? "Login with" : "Sign up with"}
        </h2>
        <p className="text-sm text-gray-300 mt-1 font-[var(--font-poppins)]">
          Use your email or continue with a provider below
        </p>
      </div>

      {/* Social Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleGoogleLogin}
          className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-900 rounded-xl py-3 font-semibold hover:opacity-90 transition"
        >
          <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
          Google
        </button>
        <button
          onClick={handleFacebookLogin}
          className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-900 rounded-xl py-3 font-semibold hover:opacity-90 transition"
        >
          <Image src="/icons/facebook.svg" alt="Facebook" width={20} height={20} />
          Facebook
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="h-px bg-white/30 flex-1"></div>
        <span className="text-white/70 text-xs">Or</span>
        <div className="h-px bg-white/30 flex-1"></div>
      </div>

      {/* Email Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {!isSignIn && (
            <FormField
              control={form.control}
              name="name"
              placeholder="Your Name"
              inputClass="bg-white/15 text-white placeholder-white/70 border border-white/30 
              rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 
              focus:border-transparent transition-all duration-200 backdrop-blur-md"
            />
          )}

          <FormField
            control={form.control}
            name="email"
            placeholder="Email Address"
            type="email"
            inputClass="bg-white/15 text-white placeholder-white/70 border border-white/30 
            rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 
            focus:border-transparent transition-all duration-200 backdrop-blur-md"
          />

          <FormField
            control={form.control}
            name="password"
            placeholder="Password"
            type="password"
            inputClass="bg-white/15 text-white placeholder-white/70 border border-white/30 
            rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 
            focus:border-transparent transition-all duration-200 backdrop-blur-md"
          />

          {isSignIn && (
            <div className="text-right">
              <button
                type="button"
                className="text-xs text-blue-300 hover:underline"
                onClick={() => handleForgotPassword(form.getValues("email"))}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-3 rounded-xl bg-white text-gray-900 font-semibold tracking-wide 
            hover:bg-gray-100 transition cursor-pointer"
          >
            {isSignIn ? "Login" : "Sign up"}
          </Button>
        </form>
      </Form>

      {/* Switch Between Forms */}
      <p className="text-center text-sm text-gray-200 mt-4 font-[var(--font-poppins)]">
        {isSignIn ? "No account yet?" : "Already have an account?"}
        <Link
          href={isSignIn ? "/sign-up" : "/sign-in"}
          className="font-bold text-blue-300 ml-1 hover:underline"
        >
          {isSignIn ? "Sign up" : "Sign in"}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;
