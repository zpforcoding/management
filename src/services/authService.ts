import { post } from "../utils/http/request";
import environment from "../utils/environment";

// 登出接口数据类型
interface LogoutData {
  refreshToken?: string;
}

/**
 * 用户认证服务
 */
class AuthService {
  /**
   * 登出方法
   * @param data 登出数据
   */
  static async logout(): Promise<boolean> {
    console.log("logout");
    
    try {
      // 获取refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        const body = new URLSearchParams();
        body.set('token', refreshToken);
        body.set('client_id', environment.app.clientId);
        
        await post(
          environment.auth.logoutUrl(), 
          body.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
      }
      
      // 清除本地存储的token
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      
      console.log('Logout successful');
      return true;
      
    } catch (error) {
      console.error('Logout failed:', error);
      // 即使登出失败，也要清除本地token
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      return false;
    }
  }

  /**
   * 获取登录重定向URL
   */
  static getLoginRedirectUrl(): string {
    return environment.auth.loginRedirectUri();
  }

  /**
   * 获取OAuth2登录URL
   */
  static getLoginUrl(): string {
    return environment.auth.loginUrl();
  }

  /**
   * 获取API基础URL
   */
  static getApiBaseUrl(): string {
    return environment.apis.default.url;
  }

  /**
   * 检查是否为生产环境
   */
  static isProduction(): boolean {
    return environment.production;
  }

  /**
   * 获取应用配置
   */
  static getAppConfig() {
    return {
      clientId: environment.app.clientId,
      scope: environment.app.scope
    };
  }
}

export default AuthService;

// 导出类型定义
export type { LogoutData };