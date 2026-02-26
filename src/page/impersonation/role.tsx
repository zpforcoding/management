import React, { useState, useEffect } from "react";
import { 
    Card, 
    Table, 
    Tag, 
    Button, 
    Space, 
    message, 
    Modal, 
    Form, 
    Input, 
    Tree, 
    Popconfirm 
} from "antd";
import type { TableProps, TreeProps } from 'antd';
import { 
    getRoles, 
    createRole, 
    updateRole, 
    deleteRole, 
    getRolePermissions, 
    assignRolePermissions,
    type RoleDTO,
    type PermissionNode,
    type CreateRoleParams,
    type UpdateRoleParams,
    type RolePermissionParams
} from "../../api/role";

export default function ImpersonationRole() {
    const [roles, setRoles] = useState<RoleDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [total, setTotal] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    
    // 新增/编辑角色弹窗
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [editingRole, setEditingRole] = useState<RoleDTO | null>(null);
    const [form] = Form.useForm();
    
    // 权限分配弹窗
    const [permissionModalVisible, setPermissionModalVisible] = useState<boolean>(false);
    const [currentRoleId, setCurrentRoleId] = useState<string>('');
    const [permissions, setPermissions] = useState<PermissionNode[]>([]);
    const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
    const [permissionLoading, setPermissionLoading] = useState<boolean>(false);

    useEffect(() => {
        loadRoles();
    }, [currentPage, pageSize]);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const skipCount = (currentPage - 1) * pageSize;
            const response = await getRoles(skipCount, pageSize);
            setRoles(response.items);
            setTotal(response.totalCount);
        } catch (error: any) {
            console.error('加载角色失败:', error);
            message.error(error.message || '加载角色数据失败');
        } finally {
            setLoading(false);
        }
    };

    // 处理新增角色
    const handleAddRole = () => {
        setEditingRole(null);
        form.resetFields();
        setModalVisible(true);
    };

    // 处理编辑角色
    const handleEditRole = (record: RoleDTO) => {
        setEditingRole(record);
        form.setFieldsValue({ name: record.name });
        setModalVisible(true);
    };

    // 保存角色（新增或编辑）
    const handleSaveRole = async () => {
        try {
            const values = await form.validateFields();
            
            if (editingRole) {
                // 编辑角色
                await updateRole(editingRole.id, values as UpdateRoleParams);
                message.success('角色更新成功');
            } else {
                // 新增角色
                await createRole(values as CreateRoleParams);
                message.success('角色创建成功');
            }
            
            setModalVisible(false);
            loadRoles();
        } catch (error: any) {
            message.error(error.message || '操作失败');
        }
    };

    // 删除角色
    const handleDeleteRole = async (roleId: string) => {
        try {
            await deleteRole(roleId);
            message.success('角色删除成功');
            loadRoles();
        } catch (error: any) {
            message.error(error.message || '删除失败');
        }
    };

    // 处理权限分配
    const handlePermissionAssign = async (roleId: string) => {
        setCurrentRoleId(roleId);
        setPermissionLoading(true);
        
        try {
            const permissionData = await getRolePermissions(roleId);
            setPermissions(permissionData);
            
            // 提取已授权的权限ID
            const grantedIds: React.Key[] = [];
            const collectGrantedIds = (nodes: PermissionNode[]) => {
                nodes.forEach(node => {
                    if (node.isGranted) {
                        grantedIds.push(node.id);
                    }
                    if (node.childrens && node.childrens.length > 0) {
                        collectGrantedIds(node.childrens);
                    }
                });
            };
            collectGrantedIds(permissionData);
            
            setCheckedKeys(grantedIds);
            setPermissionModalVisible(true);
        } catch (error: any) {
            message.error(error.message || '获取权限数据失败');
        } finally {
            setPermissionLoading(false);
        }
    };

    // 保存权限分配
    const handleSavePermissions = async () => {
        try {
            const params: RolePermissionParams = {
                roleId: currentRoleId,
                appAuths: checkedKeys.map(key => Number(key))
            };
            
            await assignRolePermissions(params);
            message.success('权限分配成功');
            setPermissionModalVisible(false);
        } catch (error: any) {
            message.error(error.message || '权限分配失败');
        }
    };

    // 树节点选择处理
    const onCheck: TreeProps['onCheck'] = (checkedKeysValue, info) => {
        let keysArray: React.Key[] = [];
        
        // 处理不同类型的checkedKeys
        if (Array.isArray(checkedKeysValue)) {
            keysArray = checkedKeysValue;
        } else {
            keysArray = checkedKeysValue.checked;
        }
        
        // 如果是父节点被选中，自动选中所有子节点
        if (info.checked && info.node.children) {
            const addChildKeys = (node: any) => {
                if (node.children) {
                    node.children.forEach((child: any) => {
                        if (!keysArray.includes(child.key)) {
                            keysArray.push(child.key);
                        }
                        addChildKeys(child);
                    });
                }
            };
            addChildKeys(info.node);
        }
        
        setCheckedKeys(keysArray);
    };

    // 处理全选/取消全选
    const handleSelectAll = (select: boolean) => {
        if (select) {
            const allKeys: React.Key[] = [];
            const collectAllKeys = (nodes: TreeNode[]) => {
                nodes.forEach(node => {
                    allKeys.push(node.key);
                    if (node.children) {
                        collectAllKeys(node.children);
                    }
                });
            };
            collectAllKeys(convertToTreeData(permissions));
            setCheckedKeys(allKeys);
        } else {
            setCheckedKeys([]);
        }
    };

    // 将权限数据转换为树形结构
    interface TreeNode {
        title: React.ReactNode;
        key: number;
        children?: TreeNode[];
    }
    
    const convertToTreeData = (permissions: PermissionNode[]): TreeNode[] => {
        return permissions.map(permission => ({
            title: (
                <span style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span style={{ 
                        fontSize: '13px', 
                        color: '#333',
                        minWidth: '90px',
                        fontFamily: 'monospace',
                        fontWeight: '600',
                        backgroundColor: '#f5f5f5',
                        padding: '2px 6px',
                        borderRadius: '3px'
                    }}>
                        {permission.name}
                    </span>
                    <span>
                        {permission.remark || permission.name}
                    </span>
                </span>
            ),
            key: permission.id,
            children: permission.childrens && permission.childrens.length > 0 
                ? convertToTreeData(permission.childrens)
                : undefined
        }));
    };

    // 获取默认展开的节点keys
    const getDefaultExpandedKeys = (permissions: PermissionNode[]): React.Key[] => {
        const expandedKeys: React.Key[] = [];
        
        const collectExpandedKeys = (nodes: PermissionNode[], level: number = 0) => {
            nodes.forEach(node => {
                // 只展开前两层，避免树形结构过长
                if (level < 2 && node.childrens && node.childrens.length > 0) {
                    expandedKeys.push(node.id);
                    collectExpandedKeys(node.childrens, level + 1);
                }
            });
        };
        
        collectExpandedKeys(permissions);
        return expandedKeys;
    };

    const columns: TableProps<RoleDTO>['columns'] = [
        {
            title: '角色名',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => {
                // 如果是admin角色，只显示权限按钮
                if (record.name === 'admin') {
                    return (
                        <Button 
                            type="default" 
                            size="small" 
                            onClick={() => handlePermissionAssign(record.id)}
                            loading={record.id === currentRoleId && permissionLoading}
                        >
                            权限
                        </Button>
                    );
                }
                
                // 其他角色显示所有操作按钮
                return (
                    <Space>
                        <Button 
                            type="primary" 
                            size="small" 
                            onClick={() => handleEditRole(record)}
                        >
                            修改
                        </Button>
                        <Button 
                            type="default" 
                            size="small" 
                            onClick={() => handlePermissionAssign(record.id)}
                            loading={record.id === currentRoleId && permissionLoading}
                        >
                            权限
                        </Button>
                        {!record.isStatic && (
                            <Popconfirm
                                title="确定删除这个角色吗？"
                                description="删除后无法恢复"
                                onConfirm={() => handleDeleteRole(record.id)}
                                okText="确定"
                                cancelText="取消"
                            >
                                <Button type="default" size="small" danger>
                                    删除
                                </Button>
                            </Popconfirm>
                        )}
                    </Space>
                );
            }
        }
    ];

    return (
        <div>
            <Card 
                title="角色管理" 
                extra={
                    <Button type="primary" onClick={handleAddRole}>
                        新增
                    </Button>
                }
            >
                <Table
                    dataSource={roles}
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
                        onChange: (page, size) => {
                            setCurrentPage(page);
                            setPageSize(size || 10);
                        }
                    }}
                />
            </Card>

            {/* 新增/编辑角色弹窗 */}
            <Modal
                title={editingRole ? "编辑角色" : "新增角色"}
                open={modalVisible}
                onOk={handleSaveRole}
                onCancel={() => setModalVisible(false)}
                okText="保存"
                cancelText="取消"
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ name: '' }}
                >
                    <Form.Item
                        name="name"
                        label="名称"
                        rules={[{ required: true, message: '请输入角色名称' }]}
                    >
                        <Input placeholder="请输入角色名称" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 权限分配弹窗 */}
            <Modal
                title="权限分配"
                open={permissionModalVisible}
                onOk={handleSavePermissions}
                onCancel={() => setPermissionModalVisible(false)}
                okText="确定"
                cancelText="取消"
                width={800}
                styles={{
                    body: { maxHeight: '60vh', overflow: 'auto' }
                }}
            >
                <div style={{ maxHeight: '50vh', overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: '4px', padding: '8px' }}>
                    <Tree
                        checkable
                        checkedKeys={checkedKeys}
                        onCheck={onCheck}
                        treeData={convertToTreeData(permissions)}
                        defaultExpandedKeys={getDefaultExpandedKeys(permissions)}
                        style={{ backgroundColor: '#fafafa' }}
                        selectable={false}
                    />
                </div>
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        已选择 {checkedKeys.length} 项权限
                    </div>
                    <div>
                        <Button 
                            type="link" 
                            size="small"
                            onClick={() => handleSelectAll(false)}
                            style={{ padding: '0 8px' }}
                        >
                            清空
                        </Button>
                        <Button 
                            type="link" 
                            size="small"
                            onClick={() => handleSelectAll(true)}
                            style={{ padding: '0 8px' }}
                        >
                            全选
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}