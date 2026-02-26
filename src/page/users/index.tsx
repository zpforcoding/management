import React from "react";
import { Card, Row, Col, Input, Button, Table, Pagination,Tag,Popconfirm,message, Modal, Select, Form } from "antd"
import "./index.scss"
import type { TableProps } from 'antd';
import { useState, useEffect, useMemo,useCallback } from "react";
import type { DataType } from "./interface";
import { getUserList, getTenantWithCount, getTenantList, copyConfig, getFmsSetting, saveFmsSetting, getUsersByTenantId, deleteUser } from "../../api/userList";
import type { PaginationProps } from 'antd';
import UserForm from "./userForm";
import { useDispatch } from "react-redux";
import { setUserData } from "../../store/user/userSlice";
interface searchType {
    name: string;
    companyName: string;
    area: string;
}

function Users() {
    const [dataList, setDataList] = useState<DataType[]>([])
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [total, setTotal] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const [isModalOpen,setIsModalOpen]=useState<boolean>(false)
    const [title,setTitle]=useState<string>("")
    const [showSplitOrder, setShowSplitOrder] = useState<boolean>(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const [copyModalVisible, setCopyModalVisible] = useState<boolean>(false)
    const [sourceTenants, setSourceTenants] = useState<DataType[]>([])
    const [selectedSourceTenant, setSelectedSourceTenant] = useState<string | undefined>(undefined)
    const [copyLoading, setCopyLoading] = useState<boolean>(false)
    const [fmsModalVisible, setFmsModalVisible] = useState<boolean>(false)
    const [fmsForm] = Form.useForm()
    const [fmsLoading, setFmsLoading] = useState<boolean>(false)
    // 模拟登录相关状态
    const [loginModalVisible, setLoginModalVisible] = useState<boolean>(false)
    const [loginUsers, setLoginUsers] = useState<any[]>([])
    const [loginLoading, setLoginLoading] = useState<boolean>(false)
    const [loginPage, setLoginPage] = useState<number>(1);
    const [loginPageSize, setLoginPageSize] = useState<number>(15);
    const [loginTotal, setLoginTotal] = useState<number>(0);
    const dispatch=useDispatch()
    const [formData, setFormData] = useState<searchType>({
        name: "",
        companyName: "",
        area: ""
    })
    useEffect(() => {
        loadData();
    }, [page, pageSize]);

    const loadData = async () => {
        setLoading(true)
        try {
            const skipCount = (page - 1) * pageSize;
            const maxResultCount = pageSize;
            
            const response = await getUserList({ 
                ...formData, 
                skipCount, 
                maxResultCount 
            });
            
            if (response.data && response.data.items) {
                setDataList(response.data.items);
                setTotal(response.data.totalCount || 0);
            } else {
                setDataList([]);
                setTotal(0);
            }
        } catch (error) {
            console.error('Load data error:', error);
            message.error('数据加载失败');
            setDataList([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }))
    }
    // const onSelectChange = (selectedRowKeys: React.Key[]) => {
    //     setSelectedRowKeys(selectedRowKeys)
    // }
    // const rowSelection = {
    //     selectedRowKeys,
    //     onChange: onSelectChange
    // }
    const onChange:PaginationProps['onChange']=(page,pageSize)=>{
       setPage(page)
       setPageSize(pageSize);
    }
    const reset=()=>{
        setSelectedRowKeys([]);
        setFormData({ name: "", companyName: "", area: ""})
        setPage(1)
        setPageSize(10);
        setShowSplitOrder(false);
        loadData()
    }
    const confirm=async function(id:string){
      try {
        const {data}= await deleteUser(id);
        message.success('租户删除成功');
        loadData();
      } catch (error) {
        message.error('租户删除失败');
        console.error('删除失败:', error);
      }
    }
    const edit=(record:DataType)=>{
        setIsModalOpen(true);
        setTitle("编辑租户");
        dispatch(setUserData(record))
    }

    const add=()=>{
        setIsModalOpen(true);
        setTitle("新增租户");
        dispatch(setUserData({}))
    }

    const showSplitOrderData = async () => {
        setLoading(true);
        setShowSplitOrder(true);
        try {
            const maxResultCount = pageSize;
            const response = await getTenantWithCount({ maxResultCount });
            
            if (response.data && response.data.items) {
                setDataList(response.data.items);
                setTotal(response.data.totalCount || 0);
            } else {
                setDataList([]);
                setTotal(0);
            }
        } catch (error) {
            console.error('Load split order data error:', error);
            message.error('拆单情况数据加载失败');
            setDataList([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }

    const hideModal=useCallback(()=>{
        setIsModalOpen(false)
    },[])

    // 获取选中的租户数据
    const getSelectedTenant = (): DataType | undefined => {
        if (selectedRowKeys.length === 0) return undefined;
        return dataList.find(item => item.id === selectedRowKeys[0]);
    };

    // 显示配置拷贝弹窗
    const showCopyModal = async () => {
        if (selectedRowKeys.length === 0) return;
        
        setCopyLoading(true);
        try {
            const response = await getTenantList();
            if (response.data && Array.isArray(response.data)) {
                setSourceTenants(response.data);
            }
            setCopyModalVisible(true);
        } catch (error) {
            console.error('获取租户列表失败:', error);
            message.error('获取租户列表失败');
        } finally {
            setCopyLoading(false);
        }
    };

    // 关闭配置拷贝弹窗
    const hideCopyModal = () => {
        setCopyModalVisible(false);
        setSelectedSourceTenant(undefined);
    };

    // 显示FMS配置弹窗
    const showFmsModal = async () => {
        if (selectedRowKeys.length === 0) return;
        
        const selectedTenant = getSelectedTenant();
        if (!selectedTenant) return;
        
        setFmsLoading(true);
        try {
            const response = await getFmsSetting(selectedTenant.id);
            if (response.data) {
                fmsForm.setFieldsValue({
                    apiUrl: response.data.apiUrl || '',
                    authUrl: response.data.authUrl || '',
                    fmsTenantName: response.data.fmsTenantName || '',
                    fmsUserName: response.data.fmsUserName || '',
                    fmsPassword: response.data.fmsPassword || ''
                });
            } else {
                fmsForm.resetFields();
            }
            setFmsModalVisible(true);
        } catch (error) {
            console.error('获取FMS配置失败:', error);
            message.error('获取FMS配置失败');
            fmsForm.resetFields();
            setFmsModalVisible(true);
        } finally {
            setFmsLoading(false);
        }
    };

    // 关闭FMS配置弹窗
    const hideFmsModal = () => {
        setFmsModalVisible(false);
        fmsForm.resetFields();
    };

    // 保存FMS配置
    const handleSaveFmsConfig = async () => {
        try {
            const values = await fmsForm.validateFields();
            const selectedTenant = getSelectedTenant();
            if (!selectedTenant) return;
            
            setFmsLoading(true);
            await saveFmsSetting({
                ...values,
                tenantId: selectedTenant.id
            });
            
            message.success('FMS配置保存成功');
            hideFmsModal();
        } catch (error: any) {
            if (error.errorFields) {
                message.error('请检查表单填写是否正确');
            } else {
                console.error('保存FMS配置失败:', error);
                message.error('保存FMS配置失败');
            }
        } finally {
            setFmsLoading(false);
        }
    };

    // 执行配置拷贝
    const handleCopyConfig = async () => {
        if (!selectedSourceTenant) {
            message.warning('请选择源租户');
            return;
        }
        
        const selectedTenant = getSelectedTenant();
        if (!selectedTenant) return;

        Modal.confirm({
            title: '确认配置拷贝',
            content: `请确认将租户【${sourceTenants.find(t => t.id === selectedSourceTenant)?.companyName}】的配置拷贝到租户【${selectedTenant.companyName}】，此操作将覆盖目标租户的原有配置。`,
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                try {
                    setCopyLoading(true);
                    await copyConfig(selectedSourceTenant, selectedTenant.id);
                    message.success('配置拷贝成功');
                    hideCopyModal();
                } catch (error) {
                    console.error('配置拷贝失败:', error);
                    message.error('配置拷贝失败');
                } finally {
                    setCopyLoading(false);
                }
            }
        });
    };

    // 显示模拟登录弹窗
    const showLoginModal = async () => {
        if (selectedRowKeys.length === 0) return;
        
        const selectedTenant = getSelectedTenant();
        if (!selectedTenant) return;
        
        setLoginLoading(true);
        try {
            const skipCount = (loginPage - 1) * loginPageSize;
            const maxResultCount = loginPageSize;
            
            const response = await getUsersByTenantId(selectedTenant.id, skipCount, maxResultCount);
            if (response.data && response.data.items) {
                setLoginUsers(response.data.items);
                setLoginTotal(response.data.totalCount || 0);
            } else {
                setLoginUsers([]);
                setLoginTotal(0);
            }
            setLoginModalVisible(true);
        } catch (error) {
            console.error('获取用户列表失败:', error);
            message.error('获取用户列表失败');
            setLoginUsers([]);
            setLoginTotal(0);
            setLoginModalVisible(true);
        } finally {
            setLoginLoading(false);
        }
    };

    // 关闭模拟登录弹窗
    const hideLoginModal = () => {
        setLoginModalVisible(false);
        setLoginUsers([]);
        setLoginPage(1);
        setLoginPageSize(15);
        setLoginTotal(0);
    };

    // 模拟登录分页变化
    const handleLoginPaginationChange = (page: number, pageSize: number) => {
        setLoginPage(page);
        setLoginPageSize(pageSize);
        
        // 重新加载当前租户的用户数据
        const selectedTenant = getSelectedTenant();
        if (selectedTenant) {
            loadLoginUsers(selectedTenant.id, page, pageSize);
        }
    };

    // 加载登录用户数据
    const loadLoginUsers = async (tenantId: string, page: number, pageSize: number) => {
        setLoginLoading(true);
        try {
            const skipCount = (page - 1) * pageSize;
            const maxResultCount = pageSize;
            
            const response = await getUsersByTenantId(tenantId, skipCount, maxResultCount);
            if (response.data && response.data.items) {
                setLoginUsers(response.data.items);
                setLoginTotal(response.data.totalCount || 0);
            } else {
                setLoginUsers([]);
                setLoginTotal(0);
            }
        } catch (error) {
            console.error('获取用户列表失败:', error);
            message.error('获取用户列表失败');
            setLoginUsers([]);
            setLoginTotal(0);
        } finally {
            setLoginLoading(false);
        }
    };
    // 模拟登录操作
    const handleSimulateLogin = (user: any) => {
        message.success(`模拟登录用户: ${user.userName}`);
        // 这里可以添加实际的模拟登录逻辑
        console.log('模拟登录用户:', user);
    };
    const onSelectChange = (selectedRowKeys: React.Key[]) => {
        // 限制只能选择一行
        if (selectedRowKeys.length > 1) {
            setSelectedRowKeys([selectedRowKeys[selectedRowKeys.length - 1]]);
        } else {
            setSelectedRowKeys(selectedRowKeys);
        }
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        type: 'checkbox' as const, // 设置为复选框模式
        columnTitle: '选择',
        fixed: true
    };

    const columns: TableProps<DataType>['columns'] = [
        {
            title: "No.",
            key: "index",
            render(value, record, index) {
                return index + 1
            },
        },
        {
            title: "租户名称",
            key: "name",
            dataIndex: "name"
        },
        {
            title: "公司名称",
            key: "companyName",
            dataIndex: "companyName"
        },
        {
            title: "是否激活",
            key: "isActivated",
            dataIndex: "isActivated",
            render: (value: boolean) => {
                return value ? 
                    <Tag color="green">激活</Tag> : 
                    <Tag color="red">未激活</Tag>
            }
        },
        {
            title: "到期日期",
            key: "dueDate",
            dataIndex: "dueDate",
            render: (value: string | null) => {
                if (!value) return '-';
                try {
                    // 解析ISO日期字符串并格式化为 YYYY-MM-DD
                    const date = new Date(value);
                    return date.toLocaleDateString('zh-CN');
                } catch (error) {
                    return value; // 如果解析失败，返回原始值
                }
            }
        },
        {
            title: "订单统计",
            key: "orderStats",
            render: (value, record) => {
                return `${record.totalOrderQty}/${record.todayOrderQty}`
            }
        },
        {
            title: "最新订单日期",
            key: "latestOrderDate",
            dataIndex: "latestOrderDate",
            render: (value: string | null) => {
                return value || '-'
            }
        },
        {
            title: "区域",
            key: "area",
            dataIndex: "area"
        },
        {
            title: "是否正式",
            key: "status",
            dataIndex: "status",
            render: (value: number) => {
                return value === 0 ? 
                    <Tag color="blue">正式</Tag> : 
                    <Tag color="orange">测试</Tag>
            }
        },
        {
            title: "操作",
            key: "operate",
            render(value, record, index) {
                return <>
                    <Button type="primary" size="small" onClick={()=>edit(record)}>编辑</Button>
                    <Popconfirm 
                        title="删除确认"
                        description="确定要删除吗？此操作不可恢复。"
                        okText="确认删除"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                        onConfirm={()=>confirm(record.id)}
                    >
                         <Button type="primary" danger size="small" className="ml">删除</Button>
                    </Popconfirm>
                   
                </>
            },
        },
    
    ];
    return <div className="users">
        <MyUserForm visible={isModalOpen} hideModal={hideModal} title={title} loadData={loadData}/>
        <Card className="search">
            <Row gutter={16}>
                <Col span={7}>
                    <p>租户名称：</p>
                    <Input name="name" value={formData.name} onChange={handleChange} />
                </Col>
                <Col span={7}>
                    <p>公司名称：</p>
                    <Input name="companyName" value={formData.companyName} onChange={handleChange} />
                </Col>
                <Col span={7}>
                    <p>区域:</p>
                    <Input name="area" value={formData.area} onChange={handleChange} />
                </Col>
                <Col span={3}>
                    <Button type="primary" onClick={loadData}>查询</Button>
                    <Button className="ml" onClick={reset}>重置</Button>
                </Col>
            </Row>
        </Card>
        <Card className="mt">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Button type="primary" onClick={add}>
                        ➕ 新增租户
                    </Button>
                    <Button 
                        type={showSplitOrder ? "default" : "primary"} 
                        className="ml"
                        onClick={showSplitOrderData}
                    >
                        {showSplitOrder ? '📊 显示全部租户' : '📈 显示拆单情况'}
                    </Button>
                </div>
                {selectedRowKeys.length > 0 && (
                    <div>
                        <Button 
                            type="primary" 
                            className="ml" 
                            onClick={showLoginModal}
                            loading={loginLoading}
                            icon={loginLoading ? undefined : <span>👤</span>}
                        >
                            模拟登录
                        </Button>
                        <Button 
                            type="dashed" 
                            className="ml" 
                            onClick={showCopyModal}
                            loading={copyLoading}
                            icon={copyLoading ? undefined : <span>📋</span>}
                        >
                            配置拷贝
                        </Button>
                        <Button 
                            type="default" 
                            className="ml" 
                            onClick={showFmsModal}
                            icon={<span>⚙️</span>}
                        >
                            FMS配置
                        </Button>
                    </div>
                )}
            </div>
        </Card>
        <Card className="mt">
            <Table
                columns={columns}
                dataSource={dataList}
                rowKey={(record) => record.id}
                loading={loading}
                rowSelection={rowSelection}
                pagination={false}
            />
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <Pagination
                    total={total}
                    current={page}
                    pageSize={pageSize}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total) => `共 ${total} 条`}
                    onChange={onChange}
                    size="small"
                />
            </div>
        </Card>

        {/* 配置拷贝弹窗 */}
        <Modal
            title={`配置拷贝 - ${getSelectedTenant()?.companyName || ''}`}
            open={copyModalVisible}
            onOk={handleCopyConfig}
            onCancel={hideCopyModal}
            confirmLoading={copyLoading}
            okText="确认"
            cancelText="取消"
        >
            <div style={{ padding: '20px 0' }}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        选择源租户：
                    </label>
                    <Select
                        style={{ width: '100%' }}
                        placeholder="请选择源租户"
                        value={selectedSourceTenant}
                        onChange={setSelectedSourceTenant}
                        showSearch
                        optionFilterProp="children"
                    >
                        {sourceTenants.map(tenant => (
                            <Select.Option key={tenant.id} value={tenant.id}>
                                {tenant.companyName}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
            </div>
        </Modal>

        {/* FMS配置弹窗 */}
        <Modal
            title={`FMS配置 - ${getSelectedTenant()?.companyName || ''}`}
            open={fmsModalVisible}
            onOk={handleSaveFmsConfig}
            onCancel={hideFmsModal}
            confirmLoading={fmsLoading}
            okText="保存"
            cancelText="取消"
            width={600}
        >
            <Form
                form={fmsForm}
                layout="vertical"
                style={{ padding: '20px 0' }}
            >
                <Form.Item
                    name="apiUrl"
                    label="接口地址"
                    rules={[{ required: true, message: '请输入接口地址' }]}
                >
                    <Input placeholder="请输入接口地址" />
                </Form.Item>
                
                <Form.Item
                    name="authUrl"
                    label="认证地址"
                    rules={[{ required: true, message: '请输入认证地址' }]}
                >
                    <Input placeholder="请输入认证地址" />
                </Form.Item>
                
                <Form.Item
                    name="fmsTenantName"
                    label="租户名"
                >
                    <Input placeholder="请输入租户名" />
                </Form.Item>
                
                <Form.Item
                    name="fmsUserName"
                    label="用户登录名"
                    rules={[{ required: true, message: '请输入用户登录名' }]}
                >
                    <Input placeholder="请输入用户登录名" />
                </Form.Item>
                
                <Form.Item
                    name="fmsPassword"
                    label="密码"
                    rules={[{ required: true, message: '请输入密码' }]}
                >
                    <Input.Password placeholder="请输入密码" />
                </Form.Item>
            </Form>
        </Modal>

        {/* 模拟登录弹窗 */}
        <Modal
            title={`模拟登录 - ${getSelectedTenant()?.companyName || ''}`}
            open={loginModalVisible}
            onCancel={hideLoginModal}
            footer={null}
            width={800}
        >
            <div style={{ padding: '20px 0' }}>
                <Table
                    dataSource={loginUsers}
                    columns={[
                        {
                            title: '登录名',
                            dataIndex: 'userName',
                            key: 'userName',
                        },
                        {
                            title: '名称',
                            dataIndex: 'name',
                            key: 'name',
                        },
                        {
                            title: '操作',
                            key: 'action',
                            render: (text: any, record: any) => (
                                <Button 
                                    type="primary" 
                                    size="small"
                                    onClick={() => handleSimulateLogin(record)}
                                >
                                    模拟登录
                                </Button>
                            ),
                        },
                    ]}
                    rowKey="id"
                    pagination={false}
                    loading={loginLoading}
                    locale={{
                        emptyText: '暂无用户数据'
                    }}
                />
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Pagination
                        total={loginTotal}
                        current={loginPage}
                        pageSize={loginPageSize}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total) => `共 ${total} 条`}
                        onChange={handleLoginPaginationChange}
                        size="small"
                    />
                </div>
            </div>
        </Modal>
    </div>
}

const MyUserForm=React.memo(UserForm)
export default Users

