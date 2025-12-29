/**
 * Activity Logger
 * 
 * This utility provides functions to log user activities throughout the application.
 * Uses GraphQL mutations to store activities in the database.
 */
import { gql } from '@apollo/client';
import apolloClient from './apolloClient';

// GraphQL mutation for creating user activity
const CREATE_USER_ACTIVITY = gql`
  mutation CreateUserActivity($input: UserActivityInput!) {
    createUserActivity(input: $input) {
      id
      user_id
      user_name
      action
      action_target
      created_at
    }
  }
`;

// 유저 ID를 정수로 안전하게 변환하는 함수
const safeParseInt = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  // 숫자로 시작하는 문자열인 경우만 변환 (예: "123" -> 123, "test" -> 0)
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
};

// Main logging function
const logActivity = async (action, actionTarget, targetId = null, description = '', userId = null, userName = null) => {
  try {
    // 명시적으로 전달된 사용자 정보가 없으면 localStorage에서 가져옴
    const rawUserId = userId || localStorage.getItem('userId');
    const finalUserId = safeParseInt(rawUserId);
    const finalUserName = userName || localStorage.getItem('userName') || '익명 사용자';

    console.log('Activity being logged:', {
      action,
      actionTarget,
      rawUserId,
      finalUserId,
      finalUserName,
      targetId,
      description
    });

    // user_id가 없거나 null 또는 0이면 로깅 중단
    if (!finalUserId || finalUserId === 0) {
      console.warn('로그인한 사용자 정보가 없어 활동 로깅을 건너뜁니다.');
      return false;
    }

    // Prepare input data
    const input = {
      user_id: finalUserId,
      user_name: finalUserName,
      action,
      action_target: actionTarget,
      target_id: targetId?.toString(),
      description
    };

    // Execute the GraphQL mutation
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_USER_ACTIVITY,
        variables: { input }
      });

      if (data && data.createUserActivity) {
        console.log('Activity logged successfully:', data.createUserActivity);
        return true;
      }
    } catch (mutationError) {
      console.error('GraphQL mutation error:', mutationError);
      // Fallback to console logging if mutation fails
      console.log('Activity logged (fallback):', {
        ...input,
        timestamp: new Date().toISOString()
      });
    }

    return true;
  } catch (error) {
    console.error('Error logging activity:', error);
    return false;
  }
};

// Pre-defined logging functions for common actions
const activityLogger = {
  // View actions
  logView: (target, targetId = null, description = '', userId = null, userName = null) => 
    logActivity('view', target, targetId, description, userId, userName),
  
  // Create actions
  logCreate: (target, targetId = null, description = '', userId = null, userName = null) => 
    logActivity('create', target, targetId, description, userId, userName),
  
  // Update actions
  logUpdate: (target, targetId = null, description = '', userId = null, userName = null) => 
    logActivity('update', target, targetId, description, userId, userName),
  
  // Delete actions
  logDelete: (target, targetId = null, description = '', userId = null, userName = null) => 
    logActivity('delete', target, targetId, description, userId, userName),
  
  // Authentication actions
  logLogin: (userId, userName) => {
    if (!userId) {
      console.warn('로그인 로깅 실패: 유효한 사용자 ID가 없습니다.');
      return false;
    }
    
    // Store user info in localStorage for later use
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', userName);
    
    return logActivity('login', '로그인', userId, '로그인 성공', userId, userName);
  },
  
  logLogout: () => {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    
    if (!userId) {
      console.warn('로그아웃 로깅 실패: 유효한 사용자 ID가 없습니다.');
      return false;
    }
    
    const result = logActivity('logout', '로그아웃', userId, '로그아웃', userId, userName);
    
    // Clear user info from localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    
    return result;
  },
  
  // Custom action logger
  logCustom: (action, target, targetId = null, description = '', userId = null, userName = null) => 
    logActivity(action, target, targetId, description, userId, userName)
};

export default activityLogger; 