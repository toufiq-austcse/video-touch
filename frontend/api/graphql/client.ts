import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';

const createApolloClient = () => {
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_JOB_BOARD_API_URL,
    credentials: 'include'
  });

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
  });
};

export default createApolloClient;