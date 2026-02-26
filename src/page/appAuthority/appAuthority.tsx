import React, { useState, useEffect } from 'react';
import { Table, Button, message, Modal, Form, Input, Spin, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CaretRightOutlined, DownOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ExpandableConfig } from 'antd/es/table/interface';
import { 
  getAppAuthorities, 
  createAppAuthority, 
  updateAppAuthority, 
  deleteAppAuthority,
  type AppAuthorityDTO,
  type CreateAuthorityParams,
  type UpdateAuthorityParams
} from '../../api/appAuthority';

// 转换为组件内部使用的树形结构
interface AppAuthorityNode {
  id: number;
  name: string;
  remark: string;
  parentId: number | null;
  isGranted: boolean;
  children?: AppAuthorityNode[];
}

// 自定义展开图标组件
const CustomExpandIcon = ({ expanded, onExpand, record }: any) => {
  if (!record.children || record.children.length === 0) {
    return <span style={{ marginRight: 16 }} />;
  }
  
  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        onExpand(record, e);
      }}
      style={{ 
        cursor: 'pointer', 
        fontSize: '14px',
        color: '#1890ff',
        marginRight: '8px',
        fontWeight: 'bold',
        transition: 'transform 0.2s ease'
      }}
    >
      {expanded ? <DownOutlined /> : <CaretRightOutlined />}
    </span>
  );
};

const AppAuthority: React.FC = () => {
  const [authorities, setAuthorities] = useState<AppAuthorityNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // 模态框状态
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAuthority, setEditingAuthority] = useState<AppAuthorityNode | null>(null);
  const [parentAuthorityId, setParentAuthorityId] = useState<number | undefined>(undefined);
  const [form] = Form.useForm();

  // 将扁平数据转换为树形结构
  const convertToTree = (flatData: AppAuthorityDTO[]): AppAuthorityNode[] => {
    // 先转换数据类型
    const nodes: AppAuthorityNode[] = flatData.map(item => ({
      id: item.id,
      name: item.name,
      remark: item.remark,
      parentId: item.parentId,
      isGranted: item.isGranted,
      children: []
    }));

    // 构建父子关系
    const nodeMap = new Map<number, AppAuthorityNode>();
    nodes.forEach(node => nodeMap.set(node.id, node));

    const roots: AppAuthorityNode[] = [];

    nodes.forEach(node => {
      if (node.parentId === null) {
        roots.push(node);
      } else {
        const parent = nodeMap.get(node.parentId);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(node);
        }
      }
    });

    return roots;
  };

  // 获取权限列表
  const fetchAuthorities = async () => {
    setLoading(true);
    setError(null);
    try {
      const flatData = await getAppAuthorities();
      const treeData = convertToTree(flatData);
      setAuthorities(treeData);
      
      // 默认展开第一层
      const firstLevelKeys = treeData.map(item => item.id);
      setExpandedRowKeys(firstLevelKeys);
      
      message.success('权限数据加载成功');
    } catch (err: any) {
      const errorMsg = err.message || '获取权限列表失败';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchAuthorities();
  }, []);

  // 添加权限
  const handleAddAuthority = (parentId?: number) => {
    setEditingAuthority(null);
    setParentAuthorityId(parentId);
    form.resetFields();
    setModalVisible(true);
  };

  // 编辑权限
  const handleEditAuthority = (record: AppAuthorityNode) => {
    setEditingAuthority(record);
    setParentAuthorityId(undefined);
    form.setFieldsValue({
      name: record.name,
      remark: record.remark
    });
    setModalVisible(true);
  };

  // 删除权限
  const handleDeleteAuthority = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个权限吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteAppAuthority(id);
          message.success('删除成功');
          fetchAuthorities(); // 重新获取数据
        } catch (error: any) {
          const errorMsg = error.message || '删除失败';
          message.error(errorMsg);
        }
      }
    });
  };

  // 处理模态框确认
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingAuthority) {
        // 编辑权限
        const params: UpdateAuthorityParams = {
          name: values.name,
          remark: values.remark
        };
        
        await updateAppAuthority(editingAuthority.id, params);
        message.success('权限修改成功');
      } else {
        // 添加权限
        const params: CreateAuthorityParams = {
          name: values.name,
          remark: values.remark,
          ...(parentAuthorityId && { parentId: parentAuthorityId })
        };
        
        await createAppAuthority(params);
        message.success(`权限添加成功！${parentAuthorityId ? `已添加到ID为${parentAuthorityId}的权限下` : '已添加为根权限'}`);
      }
      
      setModalVisible(false);
      fetchAuthorities(); // 重新获取数据
    } catch (error: any) {
      // 区分不同类型的错误
      if (error.errorFields) {
        // 表单验证错误
        message.error('请检查表单填写是否正确');
      } else if (error.message) {
        // API调用错误
        message.error(error.message);
      } else {
        // 其他错误
        message.error(editingAuthority ? '修改失败' : '添加失败');
      }
    }
  };

  // 处理模态框取消
  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingAuthority(null);
    setParentAuthorityId(undefined);
    form.resetFields();
  };

  // 表格列定义
  const columns: ColumnsType<AppAuthorityNode> = [
    {
      title: '权限Key',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: AppAuthorityNode) => (
        <span style={{
          fontWeight: record.parentId ? 'normal' : 'bold',
          color: record.parentId ? '#666' : '#333',
          fontSize: record.parentId ? '14px' : '16px',
          paddingLeft: record.parentId ? '20px' : '0'
        }}>
          {record.parentId ? (
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center',
              color: '#1890ff',
              marginRight: '8px'
            }}>
              ├─
            </span>
          ) : (
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center',
              color: '#52c41a',
              fontWeight: 'bold',
              marginRight: '8px'
            }}>
              ■
            </span>
          )}
          {text}
        </span>
      )
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      render: (text: string) => (
        <span style={{
          color: '#666',
          fontStyle: 'italic'
        }}>
          {text || '--'}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: AppAuthorityNode) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            type="primary" 
            size="small" 
            icon={<PlusOutlined />}
            onClick={() => handleAddAuthority(record.id)}
          >
            添加子权限
          </Button>
          <Button 
            type="default" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEditAuthority(record)}
          >
            修改
          </Button>
          <Button 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteAuthority(record.id)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  // 展开配置
  const expandableConfig: ExpandableConfig<AppAuthorityNode> = {
    expandedRowKeys,
    onExpandedRowsChange: (expandedKeys) => {
      setExpandedRowKeys(expandedKeys as number[]);
    },
    expandIcon: CustomExpandIcon,
    childrenColumnName: 'children',
    rowExpandable: (record) => !!record.children && record.children.length > 0,
  };

  return (
    <div className="app-authority-api" style={{ padding: '20px' }}>
      <style>
        {`
          .app-authority-api .ant-table-tbody > tr > td {
            padding: 16px 16px;
            border-bottom: 1px solid #f0f0f0;
          }
          .app-authority-api .ant-table-thead > tr > th {
            background-color: #fafafa;
            font-weight: 600;
            padding: 16px 16px;
            border-bottom: 2px solid #e8e8e8;
          }
          .app-authority-api .ant-table-row:hover > td {
            background-color: #f5f5f5 !important;
          }
          .app-authority-api .ant-table {
            border: 1px solid #f0f0f0;
            border-radius: 6px;
            overflow: hidden;
          }
        `}
      </style>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>应用权限管理</h2>
        <div>
          <Button 
            icon={<ReloadOutlined />}
            onClick={fetchAuthorities}
            disabled={loading}
            style={{ marginRight: 8 }}
          >
            刷新
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => handleAddAuthority()}
          >
            添加根权限
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert 
          message="数据加载错误" 
          description={error}
          type="error" 
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={authorities}
          rowKey="id"
          pagination={false}
          expandable={expandableConfig}
          locale={{
            emptyText: '暂无权限数据'
          }}
          scroll={{ x: 600 }}
        />
      </Spin>
      
      {/* 添加/编辑权限模态框 */}
      <Modal
        title={editingAuthority ? '编辑权限' : '添加权限'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        maskClosable={false}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          name="authorityForm"
        >
          <Form.Item
            name="name"
            label="权限Key"
            rules={[
              { required: true, message: '请输入权限Key' },
              { max: 50, message: '权限Key不能超过50个字符' }
            ]}
          >
            <Input placeholder="请输入权限Key" />
          </Form.Item>

          <Form.Item
            name="remark"
            label="备注"
            rules={[
              { required: true, message: '请输入备注' },
              { max: 200, message: '备注不能超过200个字符' }
            ]}
          >
            <Input.TextArea 
              placeholder="请输入权限备注说明" 
              rows={3}
              showCount
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AppAuthority;