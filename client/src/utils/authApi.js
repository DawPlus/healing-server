import { ApolloClient, InMemoryCache, gql, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import Swal from 'sweetalert2';
import activityLogger from './activityLogger'; // 액티비티 로거 가져오기
import { store } from '../store'; // Redux 스토어 가져오기
import { actions } from '../store/reducers/commonReducer'; // 커먼 리듀서 액션 가져오기

// GraphQL endpoint - 프로덕션에서는 같은 도메인 사용
const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:8080/graphql' : '/graphql');

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

// HTTP link with credentials
const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
  credentials: 'include' 
});

// Apollo Client instance
const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    mutate: {
      errorPolicy: 'all'
    },
    query: {
      errorPolicy: 'all'
    }
  }
});

// GraphQL queries and mutations
const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      message
      isLogin
      result
      userInfo {
        id
        user_id
        user_name
        role
        value
        viewer_level
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      message
      isLogin
      result
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      message
      isLogin
      result
    }
  }
`;

const LOGIN_CHECK_QUERY = gql`
  query LoginCheck {
    loginCheck {
      message
      isLogin
      result
      userInfo {
        id
        user_id
        user_name
        role
        value
        viewer_level
      }
    }
  }
`;

// Authentication functions
export const loginUser = async (id, password) => {
  try {
    console.log('Attempting login with GraphQL...', { id, password: '********' });
    const result = await client.mutate({
      mutation: LOGIN_MUTATION,
      variables: {
        input: { id, password }
      }
    });
    
    console.log('GraphQL login response:', result);
    
    if (result.errors) {
      console.error('GraphQL errors in response:', result.errors);
      throw new Error(result.errors[0].message);
    }
    
    const loginData = result.data.login;
    
    // 로그인 성공 시 유저 정보를 스토어에 저장
    if (loginData.isLogin && loginData.userInfo) {
      // Redux 스토어에 유저 정보 저장
      store.dispatch(actions.setValue({ key: "userInfo", value: loginData.userInfo }));
      
      // 중요: user_id가 아닌 숫자형 id를 활동 기록에 사용
      console.log('로그인 활동 기록 중:', {
        numericId: loginData.userInfo.id || loginData.userInfo.user_id,
        userName: loginData.userInfo.user_name
      });
      
      // 로그인 활동 로깅 - 숫자형 ID 사용
      activityLogger.logLogin(
        loginData.userInfo.id || loginData.userInfo.user_id, 
        loginData.userInfo.user_name
      );
    }
    
    return loginData;
  } catch (error) {
    console.error('Login error details:', error);
    
    // Extract the most useful error message
    const errorMessage = error.graphQLErrors?.[0]?.message || 
                         error.networkError?.message || 
                         error.message || 
                         '로그인 중 오류가 발생했습니다.';
    
    Swal.fire({
      icon: 'error',
      title: '로그인 오류',
      text: errorMessage,
    });
    throw error;
  }
};

export const registerUser = async (id, name, password) => {
  try {
    console.log('Attempting registration with GraphQL...', { id, name, password: '********' });
    const result = await client.mutate({
      mutation: REGISTER_MUTATION,
      variables: {
        input: { id, name, password }
      }
    });
    
    console.log('GraphQL registration response:', result);
    
    if (result.errors) {
      console.error('GraphQL errors in response:', result.errors);
      throw new Error(result.errors[0].message);
    }
    
    return result.data.register;
  } catch (error) {
    console.error('Registration error details:', error);
    
    // Extract the most useful error message
    const errorMessage = error.graphQLErrors?.[0]?.message || 
                         error.networkError?.message || 
                         error.message || 
                         '회원가입 중 오류가 발생했습니다.';
    
    Swal.fire({
      icon: 'error',
      title: '회원가입 오류',
      text: errorMessage,
    });
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // 로그아웃 전에 활동 로깅
    activityLogger.logLogout();
    
    // Redux 스토어에서 유저 정보 삭제
    store.dispatch(actions.setValue({ key: "userInfo", value: null }));
    
    const result = await client.mutate({
      mutation: LOGOUT_MUTATION
    });
    
    if (result.errors) {
      console.error('GraphQL errors in response:', result.errors);
      throw new Error(result.errors[0].message);
    }
    
    return result.data.logout;
  } catch (error) {
    console.error('Logout error details:', error);
    
    const errorMessage = error.graphQLErrors?.[0]?.message || 
                         error.networkError?.message || 
                         error.message || 
                         '로그아웃 중 오류가 발생했습니다.';
    
    Swal.fire({
      icon: 'error',
      title: '로그아웃 오류',
      text: errorMessage,
    });
    throw error;
  }
};

export const checkLoginStatus = async () => {
  try {
    const result = await client.query({
      query: LOGIN_CHECK_QUERY,
      fetchPolicy: 'network-only'
    });
    
    if (result.errors) {
      console.error('GraphQL errors in response:', result.errors);
      return { isLogin: false, message: result.errors[0].message, result: false };
    }
    
    return result.data.loginCheck;
  } catch (error) {
    console.error('Login check error details:', error);
    return { isLogin: false, message: 'Error checking login status', result: false };
  }
};

export default {
  loginUser,
  registerUser,
  logoutUser,
  checkLoginStatus
}; 