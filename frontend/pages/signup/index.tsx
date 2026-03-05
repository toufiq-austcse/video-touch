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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      <div className="m-auto h-1/3 w-1/3 flex-col">
        <div className="m-2">{error && <ErrorAlert error={error} />}</div>

        <Card className="shadow-lg m-2">
          <CardHeader>
            <CardTitle className="text-center">Sign up</CardTitle>
            <CardDescription className="text-center">
              {`Already have an account? `}
              <Link
                href={"login"}
                className="font-medium text-[#2D4AEC] hover:text-[#2D4AEC]/80"
              >
                Sign in
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                id="signup-form"
                onSubmit={form.handleSubmit(onFormSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your name"
                          {...field}
                          className="w-full"
                        />
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
                        <Input
                          placeholder="Enter your email"
                          {...field}
                          className="w-full"
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
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your password"
                          type="password"
                          {...field}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-2">
                  <Button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-[#2D4AEC] hover:bg-[#2D4AEC]/90"
                  >
                    {loading ? "Signing up..." : "Sign up"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicRoute({ Component: Signup });
