import { post, get, put, del } from "../utils/http/request";
import type { DataType } from "../page/users/interface";
interface searchType{
    skipCount?:number;
    maxResultCount?:number;
    name?:string;
    companyName?:string;
    area?:string;
}
// 获取租户
export function getUserList(data:searchType){
    return get("/api/app/tenant?",data)
}
// 新增租户接口
export function createTenant(data: any){
    return post("/api/app/tenant", data)
}

// 修改租户接口
export function updateTenant(data: any){
    return put("/api/app/tenant", data)
}

//删除租户
export function deleteTenant(id:string){
    return del(`/api/app/tenant/${id}`)
}

// 删除用户（如果需要的话）
export function deleteUser(id:string){
    return del(`/api/app/users/${id}`)
}

// 获取租户拆单情况数据
export function getTenantWithCount(data: { maxResultCount?: number }){
    return get("/api/app/tenant/with-count", data)
}

// 获取租户列表（用于配置拷贝的源租户选择）
export function getTenantList(){
    return get("/api/app/tenant/list")
}

// 配置拷贝接口
export function copyConfig(sourceTenant: string, targetTenant: string){
    return post(`/api/app/kujiale/copy-config?sourceTenant=${sourceTenant}&targetTenant=${targetTenant}`, {})
}

// 获取FMS配置
export function getFmsSetting(tenantId: string){
    return get(`/api/app/tenant/fms-setting/${tenantId}`)
}

// 保存FMS配置
export function saveFmsSetting(data: {
    apiUrl: string;
    authUrl: string;
    fmsTenantName?: string;
    fmsUserName: string;
    fmsPassword: string;
    tenantId: string;
}){
    return post('/api/app/tenant/fms-setting', data)
}

// 获取租户用户列表（模拟登录用）
export function getUsersByTenantId(tenantId: string, skipCount: number = 0, maxResultCount: number = 15){
    return get(`/api/app/users/users-by-tenant-id/${tenantId}`, { skipCount, maxResultCount })
}