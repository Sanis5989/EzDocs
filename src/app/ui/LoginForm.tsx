"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import { z } from "zod";


import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

 
const formSchema = z.object({
    username: z.string(),
      password: z.string()
      
})


export default function LoginForm() {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          username: "",
        },
      })
     
      // 2. Define a submit handler.
      function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
      }


      return (<div className="flex flex-col">
      <div className="flex">
        <text>
          Login into EZ Docs
        </text>
      </div>
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  
                  <FormControl className="w-80 h-9  text-lg">
                    <input placeholder=" Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  
                  <FormControl className="w-80 h-9 text-lg">
                    <input placeholder=" Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
        
      )

}

// import { useForm } from 'react-hook-form';

// export default function LoginForm() {

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm();


//   return (
//     <form onSubmit={handleSubmit((data) => console.log(data))}>
//       <input {...register('firstName')} />
//       <input {...register('lastName', { required: true })} />
//       {errors.lastName && <p>Last name is required.</p>}
//       <input {...register('age', { pattern: /\d+/ })} />
//       {errors.age && <p>Please enter number for age.</p>}
//       <input type="submit" />
//     </form>
//   )
// }
