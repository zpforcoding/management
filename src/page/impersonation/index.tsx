import React from "react";
import { Layout, Menu, Button, message } from "antd";
import { UserOutlined, TeamOutlined, LogoutOutlined, RollbackOutlined } from '@ant-design/icons';
import { useNavigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearToken, setToken } from "../../store/login/authSlice";
import { backToImpersonator } from "../../api/auth";

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
    // 返回我的账号
    const handleBackToMainAccount = async () => {
        try {
            const tokenData = await backToImpersonator();
            
            if (tokenData) {
                // 更新本地存储
                localStorage.setItem('auth_token', tokenData.accessToken);
                localStorage.setItem('access_token', tokenData.accessToken);
                localStorage.setItem('refresh_token', tokenData.refreshToken);
                
                // 更新Redux中的token状态
                dispatch(setToken(tokenData.accessToken));
                
                // 只有无租户的管理员才能模拟账号登录，返回后必然TenantName为空
                localStorage.removeItem('TenantName');
                localStorage.removeItem('TenantId');
                
                message.success('返回主账号成功');
                
                // 跳转到租户列表路由
                navigate("/users/list", { replace: true });
            } else {
                message.error('返回主账号失败');
            }
        } catch (error: any) {
            console.error("返回主账号失败:", error);
            message.error(error.message || '返回主账号失败');
        }
    };

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
                        type="default" 
                        icon={<RollbackOutlined />}
                        onClick={handleBackToMainAccount}
                        style={{ marginRight: '12px' }}
                    >
                        返回我的账号
                    </Button>
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