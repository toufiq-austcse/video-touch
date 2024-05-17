import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';

const createApolloClient = () => {
  const httpLink = createHttpLink({
    uri: `${process.env.NEXT_PUBLIC_VIDEO_TOUCH_API_URL}/graphql`,
    credentials: 'include'
  });

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
  });
};

export default createApolloClient;