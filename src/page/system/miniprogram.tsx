import { Card, Table, Button, Input, Modal, Form, message, Switch, Select } from "antd";
import { useState, useEffect } from "react";
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface MiniProgramPermission {
  id: number;
  appName: string;
  appId: string;
  appSecret: string;
  status: boolean;
  permissions: string[];
  createTime: string;
  updateTime: string;
}

const MiniProgramPermissionPage = () => {
  const [permissions, setPermissions] = useState<MiniProgramPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<MiniProgramPermission | null>(null);
  const [form] = Form.useForm();
  
  // 权限选项
  const permissionOptions = [
    { label: '用户信息读取', value: 'user:read' },
    { label: '用户信息写入', value: 'user:write' },
    { label: '设备控制', value: 'device:control' },
    { label: '数据上报', value: 'data:upload' },
    { label: '消息推送', value: 'message:push' },
    { label: '支付功能', value: 'payment:use' },
    { label: '地理位置', value: 'location:access' },
    { label: '摄像头访问', value: 'camera:access' },
  ];

  // 模拟数据
  useEffect(() => {
    const mockData: MiniProgramPermission[] = [
      {
        id: 1,
        appName: "智慧园区管理",
        appId: "wx1234567890abcdef",
        appSecret: "abcdefghijklmnopqrstuvwxyz123456",
        status: true,
        permissions: ["user:read", "user:write", "device:control"],
        createTime: "2024-01-10",
        updateTime: "2024-02-20"
      },
      {
        id: 2,
        appName: "访客预约系统",
        appId: "wx0987654321fedcba",
        appSecret: "zyxwvutsrqponmlkjihgfedcba654321",
        status: true,
        permissions: ["user:read", "data:upload", "message:push"],
        createTime: "2024-01-20",
        updateTime: "2024-02-15"
      },
      {
        id: 3,
        appName: "停车缴费小程序",
        appId: "wx1122334455667788",
        appSecret: "aabbccddeeffgghhiijjkkllmmnnoopp",
        status: false,
        permissions: ["payment:use"],
        createTime: "2024-02-01",
        updateTime: "2024-02-10"
      }
    ];
    setPermissions(mockData);
  }, []);

  const columns = [
    {
      title: "序号",
      key: "index",
      render: (text: any, record: MiniProgramPermission, index: number) => index + 1,
    },
    {
      title: "小程序名称",
      dataIndex: "appName",
      key: "appName",
    },
    {
      title: "AppID",
      dataIndex: "appId",
      key: "appId",
      render: (appId: string) => (
        <span style={{ fontFamily: 'monospace' }}>{appId}</span>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: boolean, record: MiniProgramPermission) => (
        <Switch
          checked={status}
          onChange={(checked) => handleStatusChange(record.id, checked)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: "权限数量",
      key: "permissions",
      render: (record: MiniProgramPermission) => `${record.permissions.length} 项`,
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
    },
    {
      title: "更新时间",
      dataIndex: "updateTime",
      key: "updateTime",
    },
    {
      title: "操作",
      key: "action",
      render: (text: any, record: MiniProgramPermission) => (
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

  const handleEdit = (record: MiniProgramPermission) => {
    setEditingPermission(record);
    form.setFieldsValue({
      ...record,
      permissions: record.permissions
    });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个小程序权限配置吗？',
      onOk: () => {
        setPermissions(permissions.filter(item => item.id !== id));
        message.success('删除成功');
      }
    });
  };

  const handleStatusChange = (id: number, status: boolean) => {
    setPermissions(permissions.map(item => 
      item.id === id 
        ? { ...item, status, updateTime: new Date().toISOString().split('T')[0] }
        : item
    ));
    message.success(`${status ? '启用' : '禁用'}成功`);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingPermission) {
        // 编辑逻辑
        setPermissions(permissions.map(item => 
          item.id === editingPermission.id 
            ? { ...item, ...values, updateTime: new Date().toISOString().split('T')[0] }
            : item
        ));
        message.success('更新成功');
      } else {
        // 新增逻辑
        const newPermission: MiniProgramPermission = {
          id: permissions.length + 1,
          ...values,
          createTime: new Date().toISOString().split('T')[0],
          updateTime: new Date().toISOString().split('T')[0]
        };
        setPermissions([...permissions, newPermission]);
        message.success('添加成功');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingPermission(null);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  return (
    <div>
      <Card 
        title="小程序权限管理"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingPermission(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新增小程序
          </Button>
        }
      >
        <Table 
          dataSource={permissions} 
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
        title={editingPermission ? "编辑小程序权限" : "新增小程序权限"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingPermission(null);
        }}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="appName"
            label="小程序名称"
            rules={[{ required: true, message: '请输入小程序名称' }]}
          >
            <Input placeholder="请输入小程序名称" />
          </Form.Item>
          
          <Form.Item
            name="appId"
            label="AppID"
            rules={[
              { required: true, message: '请输入AppID' },
              { pattern: /^wx[a-zA-Z0-9]{16}$/, message: '请输入正确的AppID格式' }
            ]}
          >
            <Input placeholder="请输入小程序AppID" />
          </Form.Item>
          
          <Form.Item
            name="appSecret"
            label="AppSecret"
            rules={[
              { required: true, message: '请输入AppSecret' },
              { pattern: /^[a-zA-Z0-9]{32}$/, message: '请输入正确的AppSecret格式' }
            ]}
          >
            <Input.Password placeholder="请输入小程序AppSecret" />
          </Form.Item>
          
          <Form.Item
            name="permissions"
            label="权限配置"
            rules={[{ required: true, message: '请选择权限' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择权限"
              options={permissionOptions}
            />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MiniProgramPermissionPage;