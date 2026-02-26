import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useState,useEffect } from 'react';
import logo from "../../assets/logo.png"
import icons from './iconList';
import { useNavigate,useLocation } from 'react-router-dom';
import { useSelector } from "react-redux";

import "./index.scss"

interface MenuItemFromData{
    key:string;
    label:string;
    icon:string;
    children?:MenuItemFromData[]
}
function NavLeft() {
    const { menuList } = useSelector((state: any) => state.authSlice);
    const navigate=useNavigate()
    const[menuData,setMenuData]=useState<MenuProps['items']>([]);
    const location=useLocation();
   // const selectedKey=location.pathname
    useEffect(()=>{
        configMenu()
    },[menuList]);
   async function configMenu(){
        const mappedMenuItems:MenuProps['items']=mapMenuItems(menuList);
        setMenuData(mappedMenuItems);
    }
    //将返回的菜单数据转换成我们需要的格式
    function mapMenuItems(items:MenuItemFromData[]):MenuProps['items']{
        return items.map((item:MenuItemFromData)=>({
            key:item.key,
            label:item.label,
            icon:icons[item.icon],
            children:item.children ? mapMenuItems(item.children) : undefined //递归操作，使用undefined而不是null
        }))
    }

    function handleClick({key}:{key:string}){
        navigate(key)
    }

    return <div className='navleft'>
        <div className='logo'>
            <img src={logo} alt="" width={18}/>
            <h1>miniapp管理平台</h1>
        </div>

        <Menu
            defaultSelectedKeys={['/dashboard']}
            mode="inline"
            theme="dark"
            items={menuData}
            onClick={handleClick}
            selectedKeys={[location.pathname]}
        />
    </div>
}
export default NavLeft