import { RouterProvider } from "react-router-dom";
import { routes } from "./router";
import { useEffect, useState, Suspense } from "react";
import { generateRoutes } from "./utils/generatesRoutes";
import { Spin } from "antd";
import { createBrowserRouter } from "react-router-dom";
import { getMenu } from "./api/auth";
import { useDispatch } from 'react-redux';
import { setMenu } from "./store/login/authSlice";
import { useSelector } from "react-redux";
function App() {
  console.log(process.env.REACT_APP_API_URL)
  const { token } = useSelector((state: any) => state.authSlice);
  const [routerss, setRouter] = useState<any>(null);
  const dispatch = useDispatch();
  useEffect(() => {
    async function loadData() {
      // const { data } = await getMenu();
      const data =  [
    {
        "icon": "DashboardOutlined",
        "label": "工作台",
        "key": "/dashboard",
    },
    {

        "icon": "TeamOutlined",
        "label": "租户管理",
        "key": "/users",
        "children": [
            {
                "icon": "UnorderedListOutlined",
                "label": "租户列表",
                "key": "/users/list",
            }
        ]
    },
    {
        "icon": "MobileOutlined",
        "label": "小程序权限",
        "key": "/app-authority",
    },
    // {
    //     "icon": "LaptopOutlined",
    //     "label": "物业管理",
    //     "key": "/estate",
    //     "children": [
    //         {

    //             "icon": "InsertRowLeftOutlined",
    //             "label": "楼宇管理",
    //             "key": "/estate/tenement",

    //         },
    //         {
    //             "icon": "BankOutlined",
    //             "label": "房间管理",
    //             "key": "/estate/room",
    //         },
    //         {
    //             "icon": "TruckOutlined",
    //             "label": "车辆信息",
    //             "key": "/estate/car",
    //         }
    //     ]
    // },
    // {
    //     "icon": "ToolOutlined",
    //     "label": "报修管理",
    //     "key": "/repair"
    // },
    // {
    //     "icon": "TransactionOutlined",
    //     "label": "招商管理",
    //     "key": "/merchants",
    // },
    // {
    //     "icon": "FundProjectionScreenOutlined",
    //     "label": "运营管理",
    //     "key": "/operation",
    //     "children": [
    //         {

    //             "icon": "FundViewOutlined",
    //             "label": "运营总览",
    //             "key": "/operation/all",

    //         },
    //         {
    //             "icon": "ReadOutlined",
    //             "label": "文章发布",
    //             "key": "/operation/article",
    //         },
    //         {
    //             "icon": "CommentOutlined",
    //             "label": "内容评论",
    //             "key": "/operation/comments",
    //         }
    //     ]
    // },
    // {
    //     "icon": "ToolOutlined",
    //     "label": "设备管理",
    //     "key": "/equipment",
    // },
    {
        "icon": "ThunderboltOutlined",
        "label": "数据统计",
        "key": "/energy",
    },
    // {
    //     "icon": "SettingOutlined",
    //     "label": "系统设置",
    //     "key": "/settings",
    // },
    // {
    //     "icon": "UserOutlined",
    //     "label": "个人中心",
    //     "key": "/personal",
    // }
]
      if (data.length) {
        dispatch(setMenu(data))
        const routers = generateRoutes(data)//动态创建的路由表
        const myRoutes = [...routes];
        myRoutes[0].children = routers;
        myRoutes[0].children[0].index = true;
        const router = createBrowserRouter(myRoutes)
        setRouter(router);
      }else{
        const router = createBrowserRouter(routes)
        setRouter(router);
      }
    }
    loadData()
  },[token])
  if (routerss) {
    return (
      <div className="App">
        <Suspense fallback={<Spin></Spin>}>
          <RouterProvider router={routerss}></RouterProvider>
        </Suspense>
      </div>
    );
  } else {
    return <Spin></Spin>
  }


}

export default App;
