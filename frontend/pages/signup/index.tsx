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
import { useAuthContext } from "@/contexts/useAuthContext";
import { NextPage } from "next";
import PublicRoute from "@/components/public-route";
import ErrorAlert from "@/components/ui/error-alert";

const formSchema = z.object({
  name: z.string({
    required_error: "Name is required",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string({
    required_error: "Password is required",
  }),
});

const Signup: NextPage = () => {
  const { userSignup } = useAuthContext();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onFormSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    let { data, error } = await userSignup(
      values.name,
      values.email,
      values.password,
    );
    setLoading(false);
    if (data) {
      localStorage.setItem("token", data.token.access_token);
      location.reload();
    } else {
      setError(error);
    }
  };

  return (
    <div className="flex m-5">
      <div className="m-auto h-1/4 w-1/4">
        {error && <ErrorAlert error={error} />}
        <h1 className="text-4xl flex justify-center">Sign Up</h1>
        <p className="flex justify-center">
          Already have an account
          <Link
            href={"login"}
            className="mx-1 underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
          >
            Login
          </Link>
        </p>
        <Form {...form}>
          <form id="signup-form" onSubmit={form.handleSubmit(onFormSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
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
                      placeholder="Enter your password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-row-reverse">
              <Button
                disabled={loading}
                type="submit"
                size="sm"
                form="signup-form"
                className="my-2"
              >
                Signup
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PublicRoute({ Component: Signup });
