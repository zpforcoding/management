import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';

export interface AppAuthority {
  id: string;
  name: string;
  parentId: string | null;
  remark: string;
  isGranted: boolean;
  children?: AppAuthority[];
}

interface CreateOrUpdateModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
  authority?: AppAuthority | null;
  parentAuthorities: AppAuthority[];
}

const { TextArea } = Input;
const { Option } = Select;

const AddAndEdit: React.FC<CreateOrUpdateModalProps> = ({
  visible,
  onCancel,
  onOk,
  authority,
  parentAuthorities
}) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  // 当模态框打开或authority变化时，重置表单
  useEffect(() => {
    if (visible) {
      if (authority) {
        // 编辑模式 - 填充表单数据
        form.setFieldsValue({
          name: authority.name,
          remark: authority.remark,
          parentId: authority.parentId || undefined
        });
      } else {
        // 新增模式 - 清空表单
        form.resetFields();
      }
    }
  }, [visible, authority, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onOk(values);
      message.success(authority ? '修改成功' : '添加成功');
      form.resetFields();
    } catch (error) {
      console.error('验证失败:', error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // 过滤掉当前编辑的权限及其子权限，避免循环引用
  const getAvailableParents = () => {
    if (!authority) {
      return parentAuthorities;
    }
    
    const filterChildren = (items: AppAuthority[], excludeId: string): AppAuthority[] => {
      return items.filter(item => item.id !== excludeId).map(item => ({
        ...item,
        children: item.children ? filterChildren(item.children, excludeId) : undefined
      })).filter(item => item.id !== excludeId || item.children?.length);
    };
    
    return filterChildren(parentAuthorities, authority.id);
  };

  return (
    <Modal
      title={authority ? '编辑权限' : '添加权限'}
      open={visible}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
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
          label="权限名称"
          rules={[
            { required: true, message: '请输入权限名称' },
            { max: 50, message: '权限名称不能超过50个字符' }
          ]}
        >
          <Input placeholder="请输入权限名称" />
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
          rules={[
            { required: true, message: '请输入备注' },
            { max: 200, message: '备注不能超过200个字符' }
          ]}
        >
          <TextArea 
            placeholder="请输入权限备注说明" 
            rows={3}
            showCount
            maxLength={200}
          />
        </Form.Item>

        <Form.Item
          name="parentId"
          label="父级权限"
        >
          <Select
            placeholder="请选择父级权限（可选）"
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option value={undefined}>作为根权限</Option>
            {getAvailableParents().map(parent => (
              <Option key={parent.id} value={parent.id}>
                {parent.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddAndEdit;
