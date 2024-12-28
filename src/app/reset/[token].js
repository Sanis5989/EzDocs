"use client"

import React from 'react'
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
import { useState , useEffect} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    email : z.string().email("Invalid email address")
})

function page() {

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues:{
            email:""
        }
    })

    const onSubmit = (data)=>{
        console.log("reset email",data);
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

export default page