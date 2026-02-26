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

// 权限树节点接口
export interface PermissionNode {
  id: number;
  name: string;
  parentId: number | null;
  remark: string;
  isGranted: boolean;
  childrens: PermissionNode[];
  isLastLevelParent: boolean;
}

// 创建角色参数
export interface CreateRoleParams {
  name: string;
}

// 更新角色参数
export interface UpdateRoleParams {
  name: string;
}

// 角色权限分配参数
export interface RolePermissionParams {
  roleId: string;
  appAuths: number[];
}

/**
 * 获取角色列表（分页）
 */
export async function getRoles(skipCount: number = 0, maxResultCount: number = 10): Promise<RoleListResponse> {
  try {
    const response = await get('/api/app/role', { skipCount, maxResultCount });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || '获取角色列表失败';
    throw new Error(errorMessage);
  }
}

/**
 * 创建角色
 */
export async function createRole(params: CreateRoleParams): Promise<RoleDTO> {
  try {
    const response = await post('/api/app/role', params);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || '创建角色失败';
    throw new Error(errorMessage);
  }
}

/**
 * 更新角色
 */
export async function updateRole(roleId: string, params: UpdateRoleParams): Promise<RoleDTO> {
  try {
    const response = await put(`/api/app/role/${roleId}`, params);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || '更新角色失败';
    throw new Error(errorMessage);
  }
}

/**
 * 删除角色
 */
export async function deleteRole(roleId: string): Promise<void> {
  try {
    await del(`/api/app/role/${roleId}`);
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || '删除角色失败';
    throw new Error(errorMessage);
  }
}

/**
 * 获取角色权限树
 */
export async function getRolePermissions(roleId: string): Promise<PermissionNode[]> {
  try {
    const response = await get(`/api/app/role/app-authority-with-childrens-by-role-id/${roleId}`);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || '获取角色权限失败';
    throw new Error(errorMessage);
  }
}

/**
 * 分配角色权限
 */
export async function assignRolePermissions(params: RolePermissionParams): Promise<void> {
  try {
    await put('/api/app/role/role-app-auth', params);
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || '分配角色权限失败';
    throw new Error(errorMessage);
  }
}