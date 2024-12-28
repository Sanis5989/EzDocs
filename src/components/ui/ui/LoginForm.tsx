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
import { useRouter } from "next/navigation";


const formSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });



export default function LoginForm() {
  const [login, setLogin] = useState(true);
  const {data: session} = useSession();
  const router = useRouter();


  type ProvidersType = Record<string, ClientSafeProvider> | null;

  const [providers, setProviders] = useState<ProvidersType>(null)
  
    
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    console.log("Submitting form", data);

    const { email, password } = data;

    try {
      const response: any = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      console.log({ response });
      if (!response?.error) {
        router.push("/");
        router.refresh();
      }

      if (response?.error) {
        // Display the error to the user
        console.error("Login Failed:", response.error);
        alert(response.error); // or show this in a UI component
        return;
      }
      console.log("Login Successful", response);
      
    } catch (error: any) {

      console.error("Login Failed:", error);
      
    }
  }

  function signUp(values: z.infer<typeof formSchema>) {
    console.log(values);
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
            Dont have an account ?{" "}
            <Link href="/Signup">
              Sign Up.
            </Link>
          </p>
          <div className="flex h-1 justify-center items-center m-3 flex-col">
            <p className="m-2">
              Reset your password{" "}
              <Link href={"/reset"} className="">
                Reset
          </Link>
            </p>
          
          {providers &&
          Object.values(providers).map((provider:any) => (
            provider.name !== "Credentials" && (
            <Button  key={provider.name}
                          onClick={() => {
                            console.log(provider.name);
                            signIn(provider.id);
                          }}>
            <Image src={"/google.svg"} alt="google image logo" width={20} height={20} className="m-2"/>
            <p className="text-center text-lg font-light">
              Continue with Google{" "}
            </p>
            </Button>)))}
          </div>
        </>
      </div>
  );
}
