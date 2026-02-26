import React from "react";
import { createBrowserRouter } from "react-router-dom";
import RequireAuth from "../utils/RequireAuth";
import { RouteObject } from "react-router-dom";

// 页面组件导入
const Home = React.lazy(() => import("../page/home"));
const Login = React.lazy(() => import("../page/login"));
const NotFound = React.lazy(() => import("../page/404"));
const Dashboard = React.lazy(() => import("../page/dashboard"));
const UserList = React.lazy(() => import("../page/users"));
const AddUser = React.lazy(() => import("../page/users/addUser"));
const Tenement = React.lazy(() => import("../page/estate/tenement"));
const Room = React.lazy(() => import("../page/estate/room"));
const Car = React.lazy(() => import("../page/estate/car"));
const Repair = React.lazy(() => import("../page/repair"));
const Contract = React.lazy(() => import("../page/finance/contract"));
const Surrender = React.lazy(() => import("../page/finance/surrender"));
const Bill = React.lazy(() => import("../page/finance/bill"));
const Merchants = React.lazy(() => import("../page/merchants"));
const All = React.lazy(() => import("../page/operation/all"));
const Article = React.lazy(() => import("../page/operation/article"));
const Comments = React.lazy(() => import("../page/operation/comments"));
const Equipment = React.lazy(() => import("../page/equipment"));
const Energy = React.lazy(() => import("../page/energy"));
const Settings = React.lazy(() => import("../page/settings"));
const Personal = React.lazy(() => import("../page/personal"));
// 系统管理模块
const TenantConfig = React.lazy(() => import("../page/system/tenantConfig"));
const Role = React.lazy(() => import("../page/system/role"));
const User = React.lazy(() => import("../page/system/user"));
const MiniProgram = React.lazy(() => import("../page/system/miniprogram"));
// 模拟登录相关页面
const Impersonation = React.lazy(() => import("../page/impersonation/index"));
const ImpersonationRole = React.lazy(() => import("../page/impersonation/role"));
const ImpersonationUser = React.lazy(() => import("../page/impersonation/user"));

export const routes:RouteObject[]=[
    // 根路径 - 主页面
    {
        path:"/",
        element: <RequireAuth allowed={true} redirectTo="/login"> <Home/> </RequireAuth>
    },
    
    // 登录页面
    {
        path:"/login",
        element:<RequireAuth allowed={false} redirectTo="/dashboard"> <Login/> </RequireAuth>
    },
    
    // 仪表盘
    {
        path:"/dashboard",
        element: <RequireAuth allowed={true} redirectTo="/login"> <Dashboard/> </RequireAuth>
    },
    
    // 租户管理
    {
        path:"/users/list",
        element: <RequireAuth allowed={true} redirectTo="/login"> <UserList/> </RequireAuth>
    },
    {
        path:"/users/add",
        element: <RequireAuth allowed={true} redirectTo="/login"> <AddUser/> </RequireAuth>
    },
    
    // 物业管理
    {
        path:"/estate/tenement",
        element: <RequireAuth allowed={true} redirectTo="/login"> <Tenement/> </RequireAuth>
    },
    {
        path:"/estate/room",
        element: <RequireAuth allowed={true} redirectTo="/login"> <Room/> </RequireAuth>
    },
    {
        path:"/estate/car",
        element: <RequireAuth allowed={true} redirectTo="/login"> <Car/> </RequireAuth>
    },
    
    // 报修管理
    {
        path:"/repair",
        element: <RequireAuth allowed={true} redirectTo="/login"> <Repair/> </RequireAuth>
    },
    
    // 财务管理
    {
        path:"/finance/contract",
        element: <RequireAuth allowed={true} redirectTo="/login"> <Contract/> </RequireAuth>
    },
    {
        path:"/finance/surrender",
        element: <RequireAuth allowed={true} redirectTo="/login"> <Surrender/> </RequireAuth>
    },
    {
        path:"/finance/bill",
        element: <RequireAuth allowed={true} redirectTo="/login"> <Bill/> </RequireAuth>
    },
    
    // 商户管理
    {
        path:"/merchants",
        element: <RequireAuth allowed={true} redirectTo="/login"> <Merchants/> </RequireAuth>
    },
    
    // 运营管理
    {
        path:"/operation/all",
        element: <RequireAuth allowed={true} redirectTo="/login"> <All/> </RequireAuth>
    },
    {
        path:"/operation/article",
        element: <RequireAuth allowed={true} redirectTo="/login"> <Article/> </RequireAuth>
    },
    {
        path:"/operation/comments",
        element: <RequireAuth allowed={true} redirectTo="/login"> <Comments/> </RequireAuth>
    },
    
    // 设备管理
    {
        path:"/equipment",
        element: <RequireAuth allowed={true} redirectTo="/login"> <Equipment/> </RequireAuth>
    },
    
    // 能源管理
    {
        path:"/energy",
        element: <RequireAuth allowed={true} redirectTo="/login"> <Energy/> </RequireAuth>
    },
    
    // 系统设置
    {
        path:"/settings",
        element: <RequireAuth allowed={true} redirectTo="/login"> <Settings/> </RequireAuth>
    },
    
    // 个人中心
    {
        path:"/personal",
        element: <RequireAuth allowed={true} redirectTo="/login"> <Personal/> </RequireAuth>
    },
    
    // 系统管理模块
    {
        path:"/system/tenant-config",
        element: <RequireAuth allowed={true} redirectTo="/login"> <TenantConfig/> </RequireAuth>
    },
    {
        path:"/system/role",
        element: <RequireAuth allowed={true} redirectTo="/login"> <Role/> </RequireAuth>
    },
    {
        path:"/system/user",
        element: <RequireAuth allowed={true} redirectTo="/login"> <User/> </RequireAuth>
    },
    {
        path:"/app-authority",
        element: <RequireAuth allowed={true} redirectTo="/login"> <MiniProgram/> </RequireAuth>
    },
    
    // 模拟登录路由
    {
        path: "/impersonation",
        element: <Impersonation />,
        children: [
            {
                path: "role",
                element: <ImpersonationRole />
            },
            {
                path: "user",
                element: <ImpersonationUser />
            },
            {
                index: true,
                element: <ImpersonationRole />
            }
        ]
    },
    
    // 404页面
    {
        path:"*",
        element:<NotFound/>
    }
]