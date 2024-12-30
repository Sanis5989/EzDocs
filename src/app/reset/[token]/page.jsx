"use client"

import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {toast } from "react-hot-toast"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { useState , useEffect} from "react";
import Image from "next/image";
import { useParams, useRouter }  from "next/navigation";

// import { useRouter } from 'next/router';

const formSchema = z.object({
    password : z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Password must be at least 6 characters")
}).superRefine(({ password, confirm_password }, ctx) => {
  if (password !== confirm_password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirm_password"], // This will highlight the confirm_password field
    });
  }});

function ResetPage() {

    // const router = nextRouter();
    const routerNext  = useRouter();
    const { token } = useParams();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues:{
            password:"",
            confirm_password:""
        }
    })

    const onSubmit = async (data)=>{
      const { password } = data;
      try {
        const response = await fetch("/api/auth/reset", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token,password}),
        });

          console.log(JSON.stringify({ token,password}))
  
        const data = await response.json();
        console.log(data)
  
        if (!response.ok) {
          toast.error(data.message)
          throw new Error(data.message || "Failed to reset password.");
        }
        toast.success(data.message)
        setTimeout(() => routerNext.push("/login"), 4000); // Redirect to login after success
      } catch (err) {
        toast.error(err.message)
        console.log(err);
        return err;
      }
    }

  return (
    <>
    <div className="flex min-h-screen flex-col items-center ">
          <div className="flex flex-col md:flex-row justify-around w-full">
         
            <div className="p-10 sm:p-0 flex-1 md:ms-32 flex justify-center items-center ">
              <Image 
                src={"/landing.png"} 
                height={750} 
                width={750} 
                style={{objectFit:"contain", marginTop:"6%"}} 
                alt="landing image of files" 
                className="max-w-full"
              />
            </div>
            <div className="flex-1 flex justify-center">
              
              <div className="flex flex-col md:mr-20 mt-10 max-w-full justify-center ">
      
      
        <div className="flex">
          <h1 className="text-7xl m-5 text-center">Reset your password.</h1>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col space-y-8 items-center w-full"
            style={{ marginTop: "7%" }}
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="w-9/12">
                  <FormControl className="w-full h-12 text-xl rounded-md">
                    <input
                      placeholder="Password"
                      {...field}
                      className="p-2"
                      type="password"
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
                      placeholder="Confirm Password"
                      {...field}
                      className="p-2"
                      type="password"
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
              Resset Password
            </Button>
          </form>
        </Form>
        <p className="text-center m-5">
          Back to log in{" "}
          <Link href="/login">
            Log In.
          </Link>
        </p>
    </div>
            </div>
          </div>
        </div>

    </>
  )
}

export default ResetPage