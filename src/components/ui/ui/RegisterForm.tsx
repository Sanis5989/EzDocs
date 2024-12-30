"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn, signOut, getProviders ,ClientSafeProvider} from "next-auth/react";


import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { useState , useEffect} from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";


const formSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    username:z.string().min(1, 'Username is required').max(100).trim(),
    password: z.string().min(8, "Password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .superRefine(({ password, confirm_password }, ctx) => {
    if (password !== confirm_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirm_password"], // This will highlight the confirm_password field
      });
    }
  });






export default function RegisterForm() {
  const [login, setLogin] = useState(true);
  const {data: session} = useSession();


  type ProvidersType = Record<string, ClientSafeProvider> | null;

  const [providers, setProviders] = useState<ProvidersType>(null)
  
    
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username:"",
      password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {

    console.log("Submitting form", data);

    const { username, email, password } = data;

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email,username, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error:", errorData.message);
        alert(errorData.message); // Show user-friendly error message
        return;
      }
      if(response.status == 201){
        console.log("Account created succesfully")
        await signIn("credentials", {
          email,
          password,
          redirect: true,
        });
      }
      // Process response here
      console.log("Registration Successful", response);
     
    } catch (error: any) {
      console.error("Registration Failed:", error);
     
    }
    console.log(data);
  }

  
  useEffect(() => {
      (async () => {
        const res = await getProviders();
        setProviders(res);
      })();
    }, []);

  return (
    <div className="flex flex-col md:mr-20 mt-10 max-w-full justify-center ">
      
        <>
          <div className="flex">
            <h1 className="text-7xl m-5 text-center">Sign Up EZ Docs</h1>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col space-y-8 items-center w-full"
              style={{ marginTop: "7%" }}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-9/12">
                    <FormControl className="w-full h-12 text-xl rounded-md">
                      <input
                        placeholder="Email"
                        {...field}
                        className="p-2"
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="w-9/12">
                    <FormControl className="w-full h-12 text-xl rounded-md">
                      <input
                        placeholder="Username"
                        {...field}
                        className="p-2"
                        type="name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="w-9/12">
                    <FormControl className="w-full h-12 text-xl rounded-md">
                      <input
                        type="password"
                        placeholder="Password"
                        {...field}
                        className="p-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem className="w-9/12">
                    <FormControl className="w-full h-12 text-xl rounded-md">
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        {...field}
                        className="p-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="flex text-lg items-center"
                size="lg"
              >
                Sign Up
              </Button>
            </form>
          </Form>
          <p className="text-center m-5">
            Already have an account?{" "}
            <Link href="/login" onClick={() => setLogin(false)}>
              Log In.
            </Link>
          </p>
          <div className="flex h-1 justify-center items-center m-3">
          {providers &&
          Object.values(providers).map((provider:any) => (
            (provider.name !== "Credentials" && <Button  key={provider.name}
                          onClick={() => {
                            signIn(provider.id);
                          }}>
            <Image src={"/google.svg"} alt="google image logo" width={20} height={20} className="m-2"/>
            <p className="text-center text-lg font-light">
              Continue with Google{" "}
            </p>
            </Button>)
            ))}
          </div>
        </>
      </div>
  );
}
