"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { useState } from "react";

const formSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
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


export default function LoginForm() {
  const [login, setLogin] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <div className="flex flex-col md:mr-20 mt-10 max-w-full justify-center ">
      {login ? (
        <>
          <div className="flex">
            <h1 className="text-7xl m-5 text-center">Login into EZ Docs</h1>
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
              <Button
                type="submit"
                className="flex text-lg items-center"
                size="lg"
              >
                Log In
              </Button>
            </form>
          </Form>
          <p className="text-center m-5">
            Don't have an account?{" "}
            <Link href="#" onClick={() => setLogin(false)}>
              Sign Up.
            </Link>
          </p>
        </>
      ) : (
        <>
          <div className="flex">
            <h1 className="text-7xl m-5 mt-10">Sign Up for EZ Docs</h1>
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
                        placeholder="Confirm password"
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
            <Link href="#" onClick={() => setLogin(true)}>
              Sign In.
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
