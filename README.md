# API 接口文档

## 目录结构说明

为了更好地组织和管理API接口，我们将原有的三个API文件重新整理为四个按业务领域划分的文件：

### 1. `auth.ts` - 认证相关接口
处理用户认证、登录、登出等安全相关功能
- `login()` - 标准OAuth2登录
- `backToImpersonator()` - 返回主账号（取消模拟登录）
- `simpleLogin()` - 简单登录（备用）
- `getMenu()` - 获取菜单
- `getAccountList()` - 获取账户列表

### 2. `tenant.ts` - 租户管理接口
处理租户相关的增删改查操作
- `getTenantList()` - 获取租户列表
- `createTenant()` - 新增租户
- `updateTenant()` - 修改租户
- `deleteTenant()` - 删除租户
- `getTenantWithCount()` - 获取租户拆单情况
- `getAllTenants()` - 获取所有租户（用于配置拷贝）
- `copyTenantConfig()` - 租户配置拷贝
- `getFmsSetting()` - 获取FMS配置
- `saveFmsSetting()` - 保存FMS配置

### 3. `userManagement.ts` - 用户和角色管理接口
处理用户和角色的管理功能
- `getRoles()` - 获取角色列表
- `getUsers()` - 获取用户列表（分页）
- `deleteUser()` - 删除用户
- `createUserWithKjl()` - 创建用户（包含酷家乐信息）
- 相关数据接口定义（RoleDTO, UserDTO, CreateUserParams等）

### 4. `impersonation.ts` - 模拟登录接口
专门处理模拟登录相关功能
- `getUsersByTenantId()` - 根据租户ID获取用户列表
- `impersonationLogin()` - 模拟登录

## 使用示例

### 认证相关
```typescript
import { login, backToImpersonator } from "../api/auth";

// 用户登录
const loginSuccess = await login('tenant123', 'username', 'password');

// 返回主账号
const tokenData = await backToImpersonator();
```

### 租户管理
```typescript
import { getTenantList, createTenant } from "../api/tenant";

// 获取租户列表
const tenants = await getTenantList({ skipCount: 0, maxResultCount: 10 });

// 创建新租户
await createTenant(tenantData);
```

### 用户管理
```typescript
import { getUsers, getRoles } from "../api/userManagement";

// 获取用户列表
const { items, totalCount } = await getUsers(0, 15);

// 获取角色列表
const roles = await getRoles(0, 999);
```

### 模拟登录
```typescript
import { getUsersByTenantId, impersonationLogin } from "../api/impersonation";

// 获取租户下的用户
const users = await getUsersByTenantId('tenantId', 0, 15);

// 执行模拟登录
const result = await impersonationLogin('tenantId', 'userId');
```

## 迁移说明

原有的文件对应关系：
- `api/users.ts` → `api/auth.ts`
- `api/userList.ts` → `api/tenant.ts` + `api/impersonation.ts`
- `api/user.ts` → `api/userManagement.ts` + `api/auth.ts`（返回主账号功能）

所有导入路径需要相应更新，请参考各页面文件中的实际使用示例。