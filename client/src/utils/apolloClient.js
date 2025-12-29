import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Create an HTTP link - 프로덕션에서는 같은 도메인 사용
const httpLink = createHttpLink({
  uri: process.env.REACT_APP_GRAPHQL_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:8080/graphql' : '/graphql'),
  credentials: 'include'
});

// Add auth token to headers if needed
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Create the Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Configure cache policies if needed
          getPage1List: {
            merge(existing, incoming) {
              return incoming;
            }
          }
        }
      }
    }
  })
});

export default client; 