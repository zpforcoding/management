import { get, post, del, put } from "../utils/http/request";

// 权限数据接口
export interface AppAuthorityDTO {
  id: number;
  name: string;
  parentId: number | null;
  remark: string;
  isGranted: boolean;
}

// 创建权限参数
export interface CreateAuthorityParams {
  name: string;
  remark: string;
  parentId?: number;
}

// 更新权限参数
export interface UpdateAuthorityParams {
  name: string;
  remark: string;
}

/**
 * 获取应用权限列表
 */
export async function getAppAuthorities(): Promise<AppAuthorityDTO[]> {
  try {
    const response = await get('/api/app/app-authority/app-authoritys');
    return response.data || [];
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || '获取权限列表失败';
    throw new Error(errorMessage);
  }
}

/**
 * 创建权限
 */
export async function createAppAuthority(params: CreateAuthorityParams): Promise<AppAuthorityDTO> {
  try {
    const response = await post('/api/app/app-authority/app-auth', params);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || '创建权限失败';
    throw new Error(errorMessage);
  }
}

/**
 * 更新权限
 */
export async function updateAppAuthority(id: number, params: UpdateAuthorityParams): Promise<AppAuthorityDTO> {
  try {
    const response = await put(`/api/app/app-authority/app-auth/${id}`, params);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || '更新权限失败';
    throw new Error(errorMessage);
  }
}

/**
 * 删除权限
 * @param id 权限ID
 * @returns Promise<void>
 * @example deleteAppAuthority(115) // 调用 /api/app/app-authority/115/app-auth
 */
export async function deleteAppAuthority(id: number): Promise<void> {
  try {
    await del(`/api/app/app-authority/${id}/app-auth`);
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || '删除权限失败';
    throw new Error(errorMessage);
  }
}