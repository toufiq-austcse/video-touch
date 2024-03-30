import "@/styles/globals.css";
import type { AppProps } from "next/app";
import createApolloClient from "@/api/graphql/client";
import { ApolloProvider } from "@apollo/client";

function MyApp({ Component, pageProps }: AppProps) {
  const client = createApolloClient();
  return (
    <div className={"min-h-screen flex flex-col m-4"}>
      <ApolloProvider client={client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </div>
  );
}

export default MyApp;
