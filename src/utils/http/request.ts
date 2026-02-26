import http from "./http"
interface ApiResponse{
    code:number;
    message:string,
    data:any
}
export function get(url:string,params?:any):Promise<ApiResponse> {
    return http.get(url,{params})
}

export function post(url:string,data?:any,config?:any):Promise<ApiResponse>{
    return http.post(url,data,config)
}

export function put(url:string,data?:any,config?:any):Promise<ApiResponse>{
    return http.put(url,data,config)
}

export function del(url:string,params?:any,config?:any):Promise<ApiResponse>{
    return http.delete(url,{params,...config})
}