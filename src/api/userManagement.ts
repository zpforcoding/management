import { get, post, put, del } from "../utils/http/request";

// 角色数据接口
export interface RoleDTO {
  id: string;
  name: string;
  isDefault: boolean;
  isStatic: boolean;
  isPublic: boolean;
  concurrencyStamp: string;
  extraProperties: Record<string, any>;
}

// 角色列表响应接口
export interface RoleListResponse {
  totalCount: number;
  items: RoleDTO[];
}

// 用户数据接口
export interface UserDTO {
  id: string;
  userName: string;
  name: string;
  email: string;
  phoneNumber?: string;
  kujialeUid?: string;
  partnerID?: string;
  roleName: string;
  isActive: boolean;
  flag: number;
  lastLoginTime: string;
}

// 创建用户参数
export interface CreateUserParams {
  userName: string;
  name: string;
  password: string;
  email?: string;
  phoneNumber?: string;
  kujialeUid?: string;
  partnerID?: string;
  roleNames: string[];
  isActive: boolean;
  flag: number;
}

/**
 * 获取角色列表（用于用户表单中的角色选择）
 */
export async function getRoles(skipCount: number = 0, maxResultCount: number = 999): Promise<RoleListResponse> {
  try {
    const response = await get('/api/app/role', { skipCount, maxResultCount });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || '获取角色列表失败';
    throw new Error(errorMessage);
  }
}

/**
 * 获取用户列表（分页）
 */
export async function getUsers(skipCount: number = 0, maxResultCount: number = 15): Promise<{ totalCount: number; items: UserDTO[] }> {
  try {
    const response = await get('/api/app/users', { skipCount, maxResultCount });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || '获取用户列表失败';
    throw new Error(errorMessage);
  }
}

/**
 * 删除用户
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    await del(`/api/app/users/${userId}`);
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || '删除用户失败';
    throw new Error(errorMessage);
  }
}

/**
 * 创建用户（包含酷家乐信息）
 */
export async function createUserWithKjl(params: CreateUserParams): Promise<UserDTO> {
  try {
    const response = await post('/api/app/users/user-with-kjl', params);
    return response.data;
  } catch (error: any) {
    // 处理API返回的错误信息结构
    const apiError = error.response?.data;
    let errorMessage = '创建用户失败';
    
    if (apiError) {
      // 优先使用API返回的具体错误信息
      if (apiError.message) {
        errorMessage = apiError.message;
      } else if (apiError.validationErrors && Array.isArray(apiError.validationErrors)) {
        // 处理验证错误
        errorMessage = apiError.validationErrors.map((err: any) => err.message || '验证失败').join('; ');
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * 更新用户信息
 */
export async function updateUserWithKjl(userId: string, params: Partial<CreateUserParams>): Promise<UserDTO> {
  try {
    const response = await put(`/api/app/users/${userId}/user-with-kjl`, params);
    return response.data;
  } catch (error: any) {
    // 处理API返回的错误信息结构
    const apiError = error.response?.data;
    let errorMessage = '更新用户失败';
    
    if (apiError) {
      // 优先使用API返回的具体错误信息
      if (apiError.message) {
        errorMessage = apiError.message;
      } else if (apiError.validationErrors && Array.isArray(apiError.validationErrors)) {
        // 处理验证错误
        errorMessage = apiError.validationErrors.map((err: any) => err.message || '验证失败').join('; ');
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
}