const prisma = require('../../../prisma/prismaClient');

module.exports = {
  loginCheck: async (_, __, { req }) => {
    if (req.session && req.session.userInfo) {
      try {
        // Verify that the user still exists in the database
        const user = await prisma.user.findUnique({
          where: {
            user_id: req.session.userInfo.user_id
          }
        });
        
        if (user) {
          // Session exists and user is valid, user is logged in
          const enhancedUserInfo = {
            ...req.session.userInfo,
            id: user.id
          };
          
          return {
            message: "logged in",
            userInfo: enhancedUserInfo,
            isLogin: true,
            result: true
          };
        } else {
          // User no longer exists in database
          req.session.destroy();
          return {
            message: "user not found",
            userInfo: null,
            isLogin: false,
            result: true
          };
        }
      } catch (error) {
        console.error('Login check error:', error);
        return {
          message: "error checking login status",
          userInfo: null,
          isLogin: false,
          result: false
        };
      }
    } else {
      // No session, user is not logged in
      return {
        message: "logged out",
        userInfo: null,
        isLogin: false,
        result: true
      };
    }
  }
}; 