import React from "react";
import { Layout, Menu, Button } from "antd";
import { UserOutlined, TeamOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearToken } from "../../store/login/authSlice";

const { Header, Content, Sider } = Layout;

export default function Impersonation() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const menuItems = [
        {
            key: 'role',
            icon: <TeamOutlined />,
            label: '角色',
            onClick: () => navigate('/impersonation/role')
        },
        {
            key: 'user',
            icon: <UserOutlined />,
            label: '用户',
            onClick: () => navigate('/impersonation/user')
        }
    ];

    const handleLogout = () => {
        // 清除浏览器所有token和存储信息
        localStorage.clear();
        sessionStorage.clear();
        
        // 清除Redux中的token状态
        dispatch(clearToken());
        
        // 跳转到登录页
        navigate("/login", { replace: true });
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ 
                background: '#fff', 
                padding: '0 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                    模拟登录
                </div>
                <div>
                    <span style={{ marginRight: '16px', color: '#666' }}>
                        当前租户: {localStorage.getItem('TenantName') || '未知'}
                    </span>
                    <Button 
                        type="primary" 
                        danger 
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                    >
                        退出登录
                    </Button>
                </div>
            </Header>
            
            <Layout>
                <Sider width={200} style={{ background: '#fff' }}>
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={['role']}
                        style={{ height: '100%', borderRight: 0 }}
                        items={menuItems}
                    />
                </Sider>
                
                <Content style={{ 
                    padding: 24, 
                    margin: 0, 
                    minHeight: 280,
                    background: '#f0f2f5'
                }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}