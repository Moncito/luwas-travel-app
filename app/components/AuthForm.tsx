"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/firebase/client";

import { signUp, setSessionCookie, signIn } from "@/lib/actions/auth.action";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import FormField from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

const authFormSchema = (type: FormType) =>
  z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6),
  });

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const isSignIn = type === "sign-in";
  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const handleForgotPassword = async (email: string) => {
    if (!email) return toast.error("Please enter your email first.");
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Reset email sent.");
    } catch {
      toast.error("Failed to send reset email.");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { name, email, password } = values;

    try {
      if (type === "sign-up") {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;
        const idToken = await user.getIdToken();

        await signUp({ uid: user.uid, name: name!, email });
        await setSessionCookie(idToken);

        toast.success("Account created successfully!");
        router.push("/");
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCred.user.getIdToken();

        await signIn({ email, idToken });

        toast.success("Logged in successfully!");
        router.push("/");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email is already registered.");
      } else if (error.code === "auth/invalid-credential") {
        toast.error("Invalid credentials.");
      } else {
        toast.error("Authentication error.");
      }
    }
  };

  return (
    <div className="card-border lg:min-w-[480px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex justify-center gap-2">
          <Image src="/logo1.png" alt="logo" width={38} height={32} />
          <h2 className="">Luwas</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4 form">
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your name"
              />
            )}
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your Email Address"
              type="email"
            />
            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your Password"
              type="password"
            />
            {isSignIn && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-xs text-user-primary hover:underline"
                  onClick={() => handleForgotPassword(form.getValues("email"))}
                >
                  Forgot Password?
                </button>
              </div>
            )}
            <Button type="submit" className="btn">
              {isSignIn ? "Sign-in" : "Create an Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm">
          {isSignIn ? "No Account Yet? " : "Have an Account Already?"}
          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="font-bold text-user-primary ml-1"
          >
            {isSignIn ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
