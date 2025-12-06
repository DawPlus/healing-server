const prisma = require('../../../prisma/prismaClient');

const { encrypt, decrypt } = require('../../../util');

module.exports = {
  login: async (_, { input }, { req }) => {
    const { id, password } = input;
    
    try {
      const encPassword = encrypt(password);
      console.log('Attempting login with Prisma. ID:', id);
      
      // Use Prisma instead of direct SQL query
      const user = await prisma.user.findUnique({
        where: {
          user_id: id
        }
      });
      console.log('user', user);
      if (user && user.user_pwd === encPassword) {
        // Save user info to session
        req.session.userInfo = {
          user_id: user.user_id,
          user_name: user.user_name,
          role: user.role,
          value: user.value
        };
        
        return {
          message: '로그인 되었습니다.',
          isLogin: true,
          result: true,
          userInfo: {
            id: user.id,
            user_id: user.user_id,
            user_name: user.user_name,
            role: user.role,
            value: user.value
          }
        };
      } else {
        return {
          message: '로그인 정보를 확인해 주세요.',
          isLogin: false,
          result: true,
          userInfo: null
        };
      }
    } catch (error) {
      console.error('Login error details:', error);
      throw new Error(`로그인 중 오류: ${error.message || '알 수 없는 오류'}`);
    }
  },
  
  register: async (_, { input }) => {
    const { id, name, password } = input;
    
    try {
      const encPassword = encrypt(password);
      console.log('Attempting registration with Prisma. ID:', id);
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: {
          user_id: id
        }
      });
      
      if (existingUser) {
        return {
          message: '이미 존재하는 사용자 ID입니다.',
          isLogin: false,
          result: false,
          userInfo: null
        };
      }
      
      // Create new user with pending role
      const newUser = await prisma.user.create({
        data: {
          user_id: id,
          user_name: name,
          user_pwd: encPassword,
          role: 'pending' // Set default role to pending
        }
      });
      
      return {
        message: '회원가입이 완료되었습니다. 관리자 승인을 기다려주세요.',
        isLogin: false,
        result: true,
        userInfo: {
          user_id: newUser.user_id,
          user_name: newUser.user_name,
          role: newUser.role
        }
      };
    } catch (error) {
      console.error('Registration error details:', error);
      throw new Error(`회원가입 중 오류: ${error.message || '알 수 없는 오류'}`);
    }
  },
  
  logout: async (_, __, { req }) => {
    try {
      if (req.session) {
        // Destroy the session
        req.session.destroy(err => {
          if (err) {
            console.error('Error destroying session:', err);
          }
        });
      }
      
      return {
        message: '로그아웃 되었습니다.',
        isLogin: false,
        result: true,
        userInfo: null
      };
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error(`로그아웃 중 오류: ${error.message || '알 수 없는 오류'}`);
    }
  },
}; 