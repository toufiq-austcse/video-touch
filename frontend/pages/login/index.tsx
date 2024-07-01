import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import React from "react";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string(),
});

export default function Login() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  return (
    <div className="flex m-5">
      <div className="m-auto h-1/4 w-1/4">
        <h1 className="text-4xl flex justify-center">Login</h1>
        <p className="flex justify-center">
          {" "}
          Don't have an account yet?{" "}
          <Link
            href={"signup"}
            className="mx-1 underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
          >
            Signup
          </Link>
        </p>
        <Form {...form}>
          <form id="login-form">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="demo@gmail.com" {...field} />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="**********"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-row-reverse">
              <Button type="submit" size="sm" form="link-form" className="my-2">
                Login
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
