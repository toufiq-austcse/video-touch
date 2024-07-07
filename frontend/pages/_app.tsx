import "@/styles/globals.css";
import type { AppProps } from "next/app";
import createApolloClient from "@/api/graphql/client";
import { ApolloProvider } from "@apollo/client";
import Navbar from "@/components/ui/navbar";
import * as React from "react";
import { AuthContextProvider } from "@/contexts/useAuthContext";
import { useEffect, useState } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    const apolloClient = createApolloClient();
    setClient(apolloClient);
  }, []);

  return (
    <AuthContextProvider>
      <div className={"min-h-screen flex flex-col"}>
        <Navbar />
        <ApolloProvider client={client}>
          <div className="m-4 max-w-full px-5 sm:px-6 lg:px-20">
            <Component {...pageProps} />
          </div>
        </ApolloProvider>
      </div>
    </AuthContextProvider>
  );
}

export default MyApp;
