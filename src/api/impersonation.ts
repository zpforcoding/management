import { post, get } from "../utils/http/request";

/**
 * 获取租户用户列表（模拟登录用）
 */
export function getUsersByTenantId(tenantId: string, skipCount: number = 0, maxResultCount: number = 15) {
    return get(`/api/app/users/users-by-tenant-id/${tenantId}`, { skipCount, maxResultCount })
}

/**
 * 模拟登录接口
 */
export function impersonationLogin(tenantId: string, userId: string) {
    const token = localStorage.getItem("access_token");
    
    // 构造表单数据
    const formData = new URLSearchParams();
    formData.set('grant_type', 'ImpersonationExtensionGrant');
    formData.set('access_token', token || '');
    formData.set('TenantId', tenantId);
    formData.set('UserId', userId);
    formData.set('client_id', 'MiniAPP_App');
    formData.set('scope', 'offline_access openid profile email MiniAPP ');
    
    // 设置请求头
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    };
    
    return post('/connect/token', formData.toString(), { headers });
}