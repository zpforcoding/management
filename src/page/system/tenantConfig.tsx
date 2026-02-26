import { Card, Table, Button, Input, Modal, Form, message } from "antd";
import { useState, useEffect } from "react";
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface TenantConfig {
  id: number;
  name: string;
  code: string;
  status: string;
  createTime: string;
  contactPerson: string;
  contactPhone: string;
}

const TenantConfigPage = () => {
  const [tenants, setTenants] = useState<TenantConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantConfig | null>(null);
  const [form] = Form.useForm();

  // 模拟数据
  useEffect(() => {
    const mockData: TenantConfig[] = [
      {
        id: 1,
        name: "北京科技园",
        code: "BJKJY001",
        status: "active",
        createTime: "2024-01-15",
        contactPerson: "张经理",
        contactPhone: "13800138001"
      },
      {
        id: 2,
        name: "上海创新园",
        code: "SHCX002",
        status: "active",
        createTime: "2024-02-20",
        contactPerson: "李主管",
        contactPhone: "13800138002"
      }
    ];
    setTenants(mockData);
  }, []);

  const columns = [
    {
      title: "序号",
      key: "index",
      render: (text: any, record: TenantConfig, index: number) => index + 1,
    },
    {
      title: "租户名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "租户编码",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "联系人",
      dataIndex: "contactPerson",
      key: "contactPerson",
    },
    {
      title: "联系电话",
      dataIndex: "contactPhone",
      key: "contactPhone",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span style={{ color: status === 'active' ? '#52c41a' : '#ff4d4f' }}>
          {status === 'active' ? '启用' : '禁用'}
        </span>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
    },
    {
      title: "操作",
      key: "action",
      render: (text: any, record: TenantConfig) => (
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

  const handleEdit = (record: TenantConfig) => {
    setEditingTenant(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个租户配置吗？',
      onOk: () => {
        setTenants(tenants.filter(item => item.id !== id));
        message.success('删除成功');
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingTenant) {
        // 编辑逻辑
        setTenants(tenants.map(item => 
          item.id === editingTenant.id 
            ? { ...item, ...values }
            : item
        ));
        message.success('更新成功');
      } else {
        // 新增逻辑
        const newTenant: TenantConfig = {
          id: tenants.length + 1,
          ...values,
          createTime: new Date().toISOString().split('T')[0]
        };
        setTenants([...tenants, newTenant]);
        message.success('添加成功');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingTenant(null);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  return (
    <div>
      <Card 
        title="租户配置管理"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTenant(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新增租户
          </Button>
        }
      >
        <Table 
          dataSource={tenants} 
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
        title={editingTenant ? "编辑租户配置" : "新增租户配置"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingTenant(null);
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="租户名称"
            rules={[{ required: true, message: '请输入租户名称' }]}
          >
            <Input placeholder="请输入租户名称" />
          </Form.Item>
          
          <Form.Item
            name="code"
            label="租户编码"
            rules={[{ required: true, message: '请输入租户编码' }]}
          >
            <Input placeholder="请输入租户编码" />
          </Form.Item>
          
          <Form.Item
            name="contactPerson"
            label="联系人"
            rules={[{ required: true, message: '请输入联系人' }]}
          >
            <Input placeholder="请输入联系人姓名" />
          </Form.Item>
          
          <Form.Item
            name="contactPhone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
            ]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <select style={{ width: '100%', padding: '4px 11px', borderRadius: '6px', border: '1px solid #d9d9d9' }}>
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
            </select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TenantConfigPage;