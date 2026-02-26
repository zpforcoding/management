import logo from "../../assets/logo.png"
import bg from "../../assets/bg.jpg"
import lgbg from "../../assets/lgbg.jpg"
import "./index.scss"
import { Button, Form, Input, message } from 'antd';
import { UserOutlined,LockOutlined  } from '@ant-design/icons';
import { login } from "../../api/users";
import AuthService from "../../services/authService";
import { setToken, clearToken } from "../../store/login/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
function Login() {
    const [form]=Form.useForm()
    const [loading,setLoading]=useState<boolean>(false)
    const dispatch=useDispatch()
    const navigate=useNavigate()

    useEffect(() => {
        form.setFieldsValue({ username: 'admin', password: '1q2w3E*' });
    }, [])

    async function handleLogin() {
        try {
            const values = await form.validateFields();
            setLoading(true);
            
            // 使用新的登录方法，传入空字符串作为租户ID（或可以根据需要传入实际租户ID）
            const loginSuccess = await login('', values.username, values.password);
            
            if (loginSuccess) {
                // 从localStorage获取token（Angular风格）
                const authToken = localStorage.getItem('auth_token');
                
                // 这里可以根据实际需求设置Redux状态或其他操作
                if (authToken) {
                    dispatch(setToken(authToken));
                    sessionStorage.setItem("username", values.username);
                    
                    // 提供明确的成功反馈
                    message.success('登录成功！正在跳转到首页...', 2);
                    
                    // 延迟跳转，让用户看到成功提示
                    setTimeout(() => {
                        navigate("/equipment", { replace: true });
                    }, 1500);
                }
            } else {
                message.error('登录失败，请检查用户名和密码');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            const errorMsg = error.response?.data?.message || '网络错误，请稍后重试';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    }
    
    // 处理登出
    const handleLogout = async () => {
        try {
            const logoutSuccess = await AuthService.logout();
            dispatch(clearToken());
            sessionStorage.clear();
            
            if (logoutSuccess) {
                message.success('登出成功');
            } else {
                message.warning('登出完成，但服务器通知失败');
            }
            
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            message.error('登出过程中出现错误');
        }
    }

    return <div className="login" style={{ backgroundImage: `url(${bg})` }}>
        <div className="lgbg" style={{ backgroundImage: `url(${lgbg})` }}>
            <div className="part">
                <div className="title">
                    <div className="logo">
                        <img src={logo} width={100} />
                    </div>
                    <h1>miniapp管理平台</h1>
                </div>
                <Form   
                    form={form}
                >
                    <Form.Item                      
                        name="username"
                        rules={[
                            { required: true, message: '用户名不能为空' },                           
                            { pattern:/^\w{4,8}$/,message:"用户名必须是4-8位数字字母组合"},
                        ]}
                    >
                        <Input placeholder="请输入您的用户名" prefix={<UserOutlined/>}/>
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '密码不能为空' }]}
                    >
                        <Input.Password placeholder="请输入您的密码" prefix={<LockOutlined/>}/>
                    </Form.Item>
                    <Form.Item >
                        <Button 
                            type="primary" 
                            style={{width:"100%"}}
                            onClick={handleLogin}
                            loading={loading}
                        >
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    </div>
}




export default Login