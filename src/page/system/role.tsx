import { Card, Table, Button, Input, Modal, Form, message, Tree } from "antd";
import { useState, useEffect } from "react";
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  createTime: string;
  permissions: string[];
}

const RolePage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();
  
  // 权限树数据
  const permissionTreeData = [
    {
      title: '系统管理',
      key: 'system',
      children: [
        { title: '用户管理', key: 'user:manage' },
        { title: '角色管理', key: 'role:manage' },
        { title: '权限管理', key: 'permission:manage' },
      ],
    },
    {
      title: '业务管理',
      key: 'business',
      children: [
        { title: '租户管理', key: 'tenant:manage' },
        { title: '财务管理', key: 'finance:manage' },
        { title: '设备管理', key: 'device:manage' },
      ],
    },
    {
      title: '报表统计',
      key: 'report',
      children: [
        { title: '数据报表', key: 'report:view' },
        { title: '统计分析', key: 'analysis:view' },
      ],
    },
  ];

  // 模拟数据
  useEffect(() => {
    const mockData: Role[] = [
      {
        id: 1,
        name: "超级管理员",
        code: "ADMIN",
        description: "拥有系统全部权限",
        createTime: "2024-01-01",
        permissions: ["user:manage", "role:manage", "permission:manage"]
      },
      {
        id: 2,
        name: "普通管理员",
        code: "MANAGER",
        description: "拥有基本管理权限",
        createTime: "2024-01-15",
        permissions: ["user:manage", "tenant:manage"]
      },
      {
        id: 3,
        name: "普通用户",
        code: "USER",
        description: "基础使用权限",
        createTime: "2024-02-01",
        permissions: ["report:view"]
      }
    ];
    setRoles(mockData);
  }, []);

  const columns = [
    {
      title: "序号",
      key: "index",
      render: (text: any, record: Role, index: number) => index + 1,
    },
    {
      title: "角色名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "角色编码",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "权限数量",
      key: "permissions",
      render: (record: Role) => `${record.permissions.length} 项`,
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
    },
    {
      title: "操作",
      key: "action",
      render: (text: any, record: Role) => (
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

  const handleEdit = (record: Role) => {
    setEditingRole(record);
    form.setFieldsValue({
      ...record,
      permissions: record.permissions
    });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个角色吗？',
      onOk: () => {
        setRoles(roles.filter(item => item.id !== id));
        message.success('删除成功');
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        // 编辑逻辑
        setRoles(roles.map(item => 
          item.id === editingRole.id 
            ? { ...item, ...values }
            : item
        ));
        message.success('更新成功');
      } else {
        // 新增逻辑
        const newRole: Role = {
          id: roles.length + 1,
          ...values,
          createTime: new Date().toISOString().split('T')[0]
        };
        setRoles([...roles, newRole]);
        message.success('添加成功');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingRole(null);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  return (
    <div>
      <Card 
        title="角色管理"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRole(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新增角色
          </Button>
        }
      >
        <Table 
          dataSource={roles} 
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
        title={editingRole ? "编辑角色" : "新增角色"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingRole(null);
        }}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          
          <Form.Item
            name="code"
            label="角色编码"
            rules={[{ required: true, message: '请输入角色编码' }]}
          >
            <Input placeholder="请输入角色编码" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="角色描述"
            rules={[{ required: true, message: '请输入角色描述' }]}
          >
            <Input.TextArea placeholder="请输入角色描述" rows={3} />
          </Form.Item>
          
          <Form.Item
            name="permissions"
            label="权限配置"
            rules={[{ required: true, message: '请选择权限' }]}
          >
            <Tree
              checkable
              treeData={permissionTreeData}
              defaultExpandedKeys={['system', 'business', 'report']}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RolePage;