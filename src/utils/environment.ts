// 环境配置文件
const environment = {
  production: process.env.NODE_ENV === 'production',
  
  // 基础API地址
  apis: {
    default: {
      url: process.env.REACT_APP_API_URL || 'https://haoyichai-API-dev.homag.com.cn'
    }
  },
  
  // 认证相关URL
  auth: {
    // OAuth2 token端点
    loginUrl: () => `${environment.apis.default.url}/connect/token`,
    // 登出端点
    logoutUrl: () => `${environment.apis.default.url}/connect/logout`,
    // 登录重定向URI
    loginRedirectUri: () => `${environment.apis.default.url}/account/login`
  },
  
  // 应用配置
  app: {
    clientId: 'MiniAPP_App',
    clientSecret: '', // 可以从环境变量读取
    scope: 'offline_access openid profile email MiniAPP'
  }
};

export default environment;

// 类型定义
export interface Environment {
  production: boolean;
  apis: {
    default: {
      url: string;
    }
  };
  auth: {
    loginUrl: () => string;
    logoutUrl: () => string;
    loginRedirectUri: () => string;
  };
  app: {
    clientId: string;
    clientSecret: string;
    scope: string;
  };
}