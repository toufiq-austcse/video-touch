import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import createApolloClient from '@/api/graphql/client';
import { ApolloProvider } from '@apollo/client';
import Navbar from '@/components/ui/navbar';
import * as React from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  const client = createApolloClient();
  return (
    <div className={'min-h-screen flex flex-col'}>
      <Navbar />
      <ApolloProvider client={client}>
        <div className="m-4">
          <Component {...pageProps} />
        </div>
      </ApolloProvider>
    </div>
  );
}

export default MyApp;
