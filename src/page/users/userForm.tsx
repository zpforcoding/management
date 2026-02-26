import { Modal, Row, Col, Form, Input, Select, DatePicker, message } from "antd"
import dayjs from "dayjs"
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { createTenant, updateTenant } from "../../api/userList";
interface FormProps {
    visible: boolean;
    hideModal: () => void;
    title: string;
    loadData:()=>void
}

interface TenantFormData {
    name: string;
    companyName: string;
    dueDate?: string;
    isActivated: boolean;
    isFormal: boolean;
    area: string;
    id?: string;
    status?: number;
    adminPassword?: string;
}

function UserForm(props: FormProps) {
    const [form] = Form.useForm();
    const { userData } = useSelector((state: any) => state.userSlice);
    const { visible, hideModal, title, loadData } = props;
    const [loading, setLoading] = useState(false);
    
    const isEdit = title === "编辑租户";
    const handleOk = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            
            // 处理日期格式
            const formData: TenantFormData = {
                ...values,
                isActivated: values.isActivated === '是',
                isFormal: values.isFormal === '是',
                dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ') : undefined
            };
            
            let result;
            if (isEdit) {
                // 修改租户
                formData.id = userData.id;
                formData.name = userData.name; // 保持原有名称
                formData.status = userData.status || 0;
                formData.adminPassword = "1q2w3E*"; // 默认密码
                result = await updateTenant(formData);
            } else {
                // 新增租户
                formData.status = 0;
                formData.adminPassword = "1q2w3E*";
                result = await createTenant(formData);
            }
            
            // 检查API响应
            const isSuccess = result instanceof Response ? result.ok : result?.data !== undefined;
            if (isSuccess) {
                message.success(isEdit ? '租户信息更新成功' : '租户创建成功');
                hideModal();
                form.resetFields();
                loadData();
            } else {
                message.error(isEdit ? '租户信息更新失败' : '租户创建失败');
            }
        } catch (error) {
            console.error('操作失败:', error);
            message.error(isEdit ? '租户信息更新失败' : '租户创建失败');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (visible) {
            if (isEdit && userData) {
                // 编辑模式：只设置可编辑的字段
                form.setFieldsValue({
                    companyName: userData.companyName || '',
                    dueDate: userData.dueDate ? dayjs(userData.dueDate) : null,
                    isActivated: userData.isActivated ? '是' : '否',
                    isFormal: userData.status === 0 ? '是' : '否',
                    area: userData.area || ''
                });
            } else {
                // 新增模式：重置表单
                form.resetFields();
            }
        }
    }, [visible, isEdit, userData]);
    return <>
        <Modal
            title={title}
            open={visible}
            onCancel={hideModal}
            width={500}
            onOk={handleOk}
            confirmLoading={loading}
            destroyOnClose
            style={{ top: 120 }}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    isActivated: '是',
                    isFormal: '是',
                    area: '华北'
                }}
            >
                {!isEdit && (
                    <>
                        <Form.Item
                            label="租户名称"
                            name="name"
                            rules={[{ required: true, message: "租户名称不能为空" }]}
                        >
                            <Input placeholder="请输入租户名称" />
                        </Form.Item>
                        <Form.Item
                            label="公司名称"
                            name="companyName"
                            rules={[{ required: true, message: "公司名称不能为空" }]}
                        >
                            <Input placeholder="请输入公司名称" />
                        </Form.Item>
                    </>
                )}
                
                {isEdit && (
                    <Form.Item
                        label="公司名称"
                        name="companyName"
                        rules={[{ required: true, message: "公司名称不能为空" }]}
                    >
                        <Input placeholder="请输入公司名称" />
                    </Form.Item>
                )}
                
                <Form.Item
                    label="到期日"
                    name="dueDate"
                >
                    <DatePicker 
                        style={{ width: '100%' }} 
                        placeholder="请选择到期日期"
                    />
                </Form.Item>
                
                <Form.Item
                    label="是否激活"
                    name="isActivated"
                    rules={[{ required: true, message: "请选择是否激活" }]}
                >
                    <Select placeholder="请选择">
                        <Select.Option value="是">是</Select.Option>
                        <Select.Option value="否">否</Select.Option>
                    </Select>
                </Form.Item>
                
                <Form.Item
                    label="是否正式"
                    name="isFormal"
                    rules={[{ required: true, message: "请选择是否正式" }]}
                >
                    <Select placeholder="请选择">
                        <Select.Option value="是">是</Select.Option>
                        <Select.Option value="否">否</Select.Option>
                    </Select>
                </Form.Item>
                
                <Form.Item
                    label="所属区域"
                    name="area"
                    rules={[{ required: true, message: "请选择所属区域" }]}
                >
                    <Select placeholder="请选择区域">
                        <Select.Option value="华东">华东</Select.Option>
                        <Select.Option value="华西">华西</Select.Option>
                        <Select.Option value="华南">华南</Select.Option>
                        <Select.Option value="华北">华北</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>

    </>
}
export default UserForm