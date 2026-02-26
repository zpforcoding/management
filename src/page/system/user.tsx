import { Card, Table, Button, Input, Modal, Form, message, Select, Tag } from "antd";
import { useState, useEffect } from "react";
import { PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';

interface User {
  id: number;
  username: string;
  realName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createTime: string;
  lastLogin: string;
}

const UserPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  
  // 角色选项
  const roleOptions = [
    { label: '超级管理员', value: 'ADMIN' },
    { label: '管理员', value: 'MANAGER' },
    { label: '普通用户', value: 'USER' },
  ];

  // 模拟数据
  useEffect(() => {
    const mockData: User[] = [
      {
        id: 1,
        username: "admin",
        realName: "系统管理员",
        email: "admin@example.com",
        phone: "13800138000",
        role: "ADMIN",
        status: "active",
        createTime: "2024-01-01",
        lastLogin: "2024-02-25 14:30:22"
      },
      {
        id: 2,
        username: "manager",
        realName: "运营经理",
        email: "manager@example.com",
        phone: "13800138001",
        role: "MANAGER",
        status: "active",
        createTime: "2024-01-15",
        lastLogin: "2024-02-24 16:45:11"
      },
      {
        id: 3,
        username: "user001",
        realName: "普通用户",
        email: "user001@example.com",
        phone: "13800138002",
        role: "USER",
        status: "inactive",
        createTime: "2024-02-01",
        lastLogin: "2024-02-20 09:15:33"
      }
    ];
    setUsers(mockData);
  }, []);

  const columns = [
    {
      title: "序号",
      key: "index",
      render: (text: any, record: User, index: number) => index + 1,
    },
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "真实姓名",
      dataIndex: "realName",
      key: "realName",
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "手机号",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        const roleMap: Record<string, { text: string; color: string }> = {
          ADMIN: { text: '超级管理员', color: 'red' },
          MANAGER: { text: '管理员', color: 'blue' },
          USER: { text: '普通用户', color: 'green' },
        };
        const roleInfo = roleMap[role] || { text: role, color: 'default' };
        return <Tag color={roleInfo.color}>{roleInfo.text}</Tag>;
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
    },
    {
      title: "最后登录",
      dataIndex: "lastLogin",
      key: "lastLogin",
    },
    {
      title: "操作",
      key: "action",
      render: (text: any, record: User) => (
        <div>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === 'active' ? '禁用' : '启用'}
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？',
      onOk: () => {
        setUsers(users.filter(item => item.id !== id));
        message.success('删除成功');
      }
    });
  };

  const handleToggleStatus = (record: User) => {
    const newStatus = record.status === 'active' ? 'inactive' : 'active';
    setUsers(users.map(item => 
      item.id === record.id 
        ? { ...item, status: newStatus }
        : item
    ));
    message.success(`${newStatus === 'active' ? '启用' : '禁用'}成功`);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        // 编辑逻辑
        setUsers(users.map(item => 
          item.id === editingUser.id 
            ? { ...item, ...values }
            : item
        ));
        message.success('更新成功');
      } else {
        // 新增逻辑
        const newUser: User = {
          id: users.length + 1,
          ...values,
          createTime: new Date().toISOString().split('T')[0],
          lastLogin: '-'
        };
        setUsers([...users, newUser]);
        message.success('添加成功');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingUser(null);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  return (
    <div>
      <Card 
        title="用户管理"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingUser(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新增用户
          </Button>
        }
      >
        <Table 
          dataSource={users} 
          columns={columns} 
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={editingUser ? "编辑用户" : "新增用户"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingUser(null);
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { pattern: /^\w{4,20}$/, message: '用户名必须是4-20位字母数字下划线' }
            ]}
          >
            <Input placeholder="请输入用户名" disabled={!!editingUser} />
          </Form.Item>
          
          <Form.Item
            name="realName"
            label="真实姓名"
            rules={[{ required: true, message: '请输入真实姓名' }]}
          >
            <Input placeholder="请输入真实姓名" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]}
          >
            <Input placeholder="请输入邮箱地址" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
            ]}
          >
            <Input placeholder="请输入手机号码" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              {roleOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' }
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default UserPage;