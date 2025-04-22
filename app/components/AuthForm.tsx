"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import FormField from "@/components/FormField"
import { useRouter } from "next/navigation"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth"
import { auth } from "@/firebase/client"
import {
  setSessionCookie,
  signIn,
  signUp,
} from "@/lib/actions/auth.action"

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  })
}

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter()
  const formSchema = authFormSchema(type)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const isSignIn = type === "sign-in"

  const handleForgotPassword = async (email: string) => {
    if (!email) {
      toast.error("Please enter your email first.")
      return
    }

    try {
      await sendPasswordResetEmail(auth, email)
      toast.success("Password reset email sent. Check your inbox.")
    } catch (error) {
      console.error(error)
      toast.error("Error sending password reset email.")
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (type === "sign-up") {
        const { name, email, password } = values

        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        )
        const user = userCredentials.user
        const idToken = await user.getIdToken()

        const result = await signUp({
          uid: user.uid,
          name: name!,
          email,
          password,
        })

        await setSessionCookie(idToken)

        if (!result?.success) {
          toast.error(result?.message)
          return
        }

        toast.success("Account Created Successfully. Please Sign in.")
        router.push("/sign-in")
      } else {
        const { email, password } = values

        const userCredentials = await signInWithEmailAndPassword(
          auth,
          email,
          password
        )

        const idToken = await userCredentials.user.getIdToken()

        if (!idToken) {
          toast.error("Sign-in Failed")
          return
        }

        await signIn({ email, idToken })

        toast.success("Login Successful")
        router.push("/")
      }
    } catch (e) {
      console.log(e)
      toast.error(`There was an Error: ${e}`)
    }

    console.log(values)
  }

  return (
    <div className="card-border lg:min-w-[480px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo1.png" alt="logo" height={32} width={38} />
          <h2 className="">Luwas</h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
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

            <Button className="btn" type="submit">
              {isSignIn ? "Sign-in" : "Create an Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? "No Account Yet? " : "Have an Account Already?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? "Sign in" : "Sign up"}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default AuthForm
