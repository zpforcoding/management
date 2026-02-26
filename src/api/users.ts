
import { post,get } from "../utils/http/request";
import environment from "../utils/environment";
interface LoginData{
    username:string,
    password:string
}

interface TenantLoginData{
    tenant?: string,
    username: string,
    password: string
}

interface AccountData{
    accountName:string
}
export async function login(tenantId: string, username: string, password: string): Promise<boolean> {
    console.log("login", tenantId);
    
    try {
        // 构造请求头
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            '__tenant': tenantId !== undefined ? tenantId : "",
            'Authorization': ""
        };
        
        // 构造OAuth2登录表单数据
        const body = new URLSearchParams();
        body.set('grant_type', 'password');
        body.set('username', username);
        body.set('password', password);
        body.set('client_id', 'MiniAPP_App');
        body.set('scope', 'offline_access openid profile email MiniAPP');
        
        // 发送登录请求
        const response = await post(environment.auth.loginUrl(), body.toString(), { 
            headers: { 
                ...headers,
                'Content-Type': 'application/x-www-form-urlencoded' 
            } 
        });
        
        // 处理响应
        if (response && response.data && response.data.access_token) {

            localStorage.setItem('auth_token', response.data.access_token);
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
            
            console.log('Login successful');
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('Login error', error);
        return false;
    }
}

// 保持原有的简单登录方法作为备选
export function simpleLogin(data: LoginData): Promise<any> {
    return post("/login", data);
}

export function getMenu(){
    return get("/menu")
}

export function getAccountList(data:AccountData){
    return post("/accountList",data)
}