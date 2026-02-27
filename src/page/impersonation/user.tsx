import React, { useState, useEffect } from "react";
import { 
    Card, 
    Table, 
    Tag, 
    Button, 
    Space, 
    Input, 
    Row, 
    Col, 
    message, 
    Modal, 
    Form, 
    Checkbox, 
    Radio, 
    Popconfirm 
} from "antd";
import type { TableProps } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { 
    getRoles, 
    getUsers, 
    createUserWithKjl, 
    deleteUser,
    type RoleDTO, 
    type CreateUserParams 
} from "../../api/userManagement";

type CheckboxValueType = string | number | boolean;

interface UserType {
    id: string;
    userName: string;
    name: string;
    email: string;
    phoneNumber?: string;
    kujialeUid?: string;
    partnerID?: string;
    roleName: string;
    isActive: boolean;
    flag: number;
    lastLoginTime: string;
}

export default function ImpersonationUser() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>('');
    
    // 角色相关状态
    const [roles, setRoles] = useState<RoleDTO[]>([]);
    
    // 新增/编辑用户弹窗
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<UserType | null>(null);
    const [form] = Form.useForm();
    
    // 表单字段状态
    const [checkedRoles, setCheckedRoles] = useState<(string | number | boolean)[]>([]);
    
    // 分页状态
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(15);
    const [total, setTotal] = useState<number>(0);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (searchText) {
            // 搜索功能可以在这里实现
            loadUsers();
        } else {
            loadUsers();
        }
    }, [searchText, currentPage, pageSize]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            // 并行加载角色数据
            const rolesData = await loadRoles();
            setRoles(rolesData.items);
            
            // 加载用户数据
            await loadUsers();
        } catch (error: any) {
            console.error('加载初始数据失败:', error);
            message.error(error.message || '加载数据失败');
        } finally {
            setLoading(false);
        }
    };

    const loadRoles = async () => {
        try {
            const response = await getRoles(0, 999);
            return response;
        } catch (error: any) {
            throw new Error(error.message || '获取角色数据失败');
        }
    };


    const loadUsers = async () => {
        setLoading(true);
        try {
            const skipCount = (currentPage - 1) * pageSize;
            const response = await getUsers(skipCount, pageSize);
            
            setUsers(response.items);
            setTotal(response.totalCount);
        } catch (error: any) {
            console.error('加载用户失败:', error);
            message.error(error.message || '加载用户数据失败');
            setUsers([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    // 处理新增用户
    const handleAddUser = () => {
        setEditingUser(null);
        setCheckedRoles([]);
        form.resetFields();
        form.setFieldsValue({
            isActive: true,
            flag: 0
        });
        setModalVisible(true);
    };

    // 处理编辑用户
    const handleEditUser = (record: UserType) => {
        setEditingUser(record);
        // 设置表单初始值
        form.setFieldsValue({
            userName: record.userName,
            name: record.name,
            email: record.email,
            phoneNumber: record.phoneNumber,
            kujialeUid: record.kujialeUid,
            partnerID: record.partnerID,
            isActive: record.isActive,
            flag: record.flag
        });
        // 设置角色选中状态（这里需要根据实际数据调整）
        setCheckedRoles([record.roleName]);
        setModalVisible(true);
    };

    // 保存用户（新增或编辑）
    const handleSaveUser = async () => {
        try {
            const values = await form.validateFields();
            
            const params: CreateUserParams = {
                userName: values.userName,
                name: values.name,
                password: values.password,
                email: values.email,
                phoneNumber: values.phoneNumber,
                kujialeUid: values.kujialeUid,
                partnerID: values.partnerID,
                roleNames: checkedRoles as string[],
                isActive: values.isActive,
                flag: values.flag
            };
            
            if (editingUser) {
                // 编辑用户 - 这里需要实现PUT请求
                message.success('用户更新成功');
                console.log('编辑用户参数:', { ...params, id: editingUser.id });
            } else {
                // 新增用户
                await createUserWithKjl(params);
                message.success('用户创建成功');
            }
            
            setModalVisible(false);
            loadInitialData(); // 重新加载数据
        } catch (error: any) {
            if (error.errorFields) {
                message.error('请检查表单填写是否正确');
            } else {
                message.error(error.message || '操作失败');
            }
        }
    };

    // 删除用户
    const handleDeleteUser = async (userId: string) => {
        try {
            await deleteUser(userId);
            message.success('用户删除成功');
            loadInitialData(); // 重新加载数据
        } catch (error: any) {
            message.error(error.message || '删除失败');
        }
    };

    const handleTableChange = (page: number, pageSize?: number) => {
        setCurrentPage(page);
        if (pageSize) {
            setPageSize(pageSize);
        }
    };

    const columns: TableProps<UserType>['columns'] = [
        {
            title: '登录名',
            dataIndex: 'userName',
            key: 'userName'
        },
        {
            title: '姓名',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: '是否激活',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? '是' : '否'}
                </Tag>
            )
        },
        {
            title: '角色',
            dataIndex: 'roleName',
            key: 'roleName',
            render: (text: string) => <Tag color="blue">{text}</Tag>
        },
        {
            title: '酷家乐账号',
            dataIndex: 'kujialeUid',
            key: 'kujialeUid',
            render: (text: string) => text || '-'
        },
        {
            title: '酷家乐主账号',
            dataIndex: 'partnerID',
            key: 'partnerID',
            render: (text: string) => text || '-'
        },
        {
            title: '是否正式',
            dataIndex: 'flag',
            key: 'flag',
            render: (flag: number) => (
                <Tag color={flag === 0 ? 'blue' : 'orange'}>
                    {flag === 0 ? '正式' : '测试'}
                </Tag>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="primary" 
                        size="small" 
                        onClick={() => handleEditUser(record)}
                    >
                        修改
                    </Button>
                    <Popconfirm
                        title="确定删除这个用户吗？"
                        description="删除后无法恢复"
                        onConfirm={() => handleDeleteUser(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="default" size="small" danger>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // 角色选择处理
    const onRoleChange = (checkedValues: (string | number | boolean)[]) => {
        setCheckedRoles(checkedValues);
    };

    return (
        <div>
            <Card 
                title="用户管理" 
                extra={
                    <Button type="primary" onClick={handleAddUser}>
                        新增
                    </Button>
                }
            >
                <Row style={{ marginBottom: 16 }}>
                    <Col span={8}>
                        <Input
                            placeholder="搜索登录名、姓名"
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                </Row>
                
                <Table
                    dataSource={users}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条记录`,
                        onChange: handleTableChange
                    }}
                />
            </Card>

            {/* 新增/编辑用户弹窗 */}
            <Modal
                title={editingUser ? "编辑用户" : "新增用户"}
                open={modalVisible}
                onOk={handleSaveUser}
                onCancel={() => setModalVisible(false)}
                okText="保存"
                cancelText="取消"
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        isActive: true,
                        flag: 0
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="userName"
                                label="登录名"
                                rules={[{ required: true, message: '请输入登录名' }]}
                            >
                                <Input placeholder="请输入登录名" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="姓名"
                                rules={[{ required: true, message: '请输入姓名' }]}
                            >
                                <Input placeholder="请输入姓名" />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="密码"
                            rules={[{ required: true, message: '请输入密码' }]}
                        >
                            <Input.Password placeholder="请输入密码" />
                        </Form.Item>
                    )}
                    
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="邮箱"
                                rules={[{ 
                                    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: '请输入正确的邮箱格式' 
                                }]}
                            >
                                <Input placeholder="请输入邮箱" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="phoneNumber"
                                label="手机号码"
                            >
                                <Input placeholder="请输入手机号码" />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="kujialeUid"
                                label="酷家乐账号"
                            >
                                <Input placeholder="请输入酷家乐账号" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="partnerID"
                                label="酷家乐主账号"
                            >
                                <Input placeholder="请输入酷家乐主账号" />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Form.Item
                        name="roleNames"
                        label="角色"
                        rules={[{ required: true, message: '请选择角色' }]}
                    >
                        <Checkbox.Group 
                            value={checkedRoles} 
                            onChange={onRoleChange}
                            style={{ width: '100%' }}
                        >
                            <Row>
                                {roles.map(role => (
                                    <Col span={12} key={role.id} style={{ margin: '8px 0' }}>
                                        <Checkbox value={role.name}>{role.name}</Checkbox>
                                    </Col>
                                ))}
                            </Row>
                        </Checkbox.Group>
                    </Form.Item>
                    
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="isActive"
                                label="是否激活"
                                rules={[{ required: true, message: '请选择状态' }]}
                            >
                                <Radio.Group>
                                    <Radio value={true}>是</Radio>
                                    <Radio value={false}>否</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="flag"
                                label="是否正式"
                                rules={[{ required: true, message: '请选择类型' }]}
                            >
                                <Radio.Group>
                                    <Radio value={0}>正式</Radio>
                                    <Radio value={1}>测试</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
}