import React from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  CommentOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useInfo from '../hook/useInfo';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {dataInfo} = useInfo()

  const user = {
    name: 'Admin User',
    avatarUrl: '',
  };

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: <Link to="/admin/users">Users</Link>,
    },
    {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: <Link to="/admin/products">Products</Link>,
    },
    {
      key: '/admin/orders',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/admin/orders">Orders</Link>,
    },
    {
      key: '/admin/evaluate',
      icon: <CommentOutlined />,
      label: <Link to="/admin/evaluate">Evaluate</Link>,
    },
    {
      key: '/admin/warranty',
      icon: <ToolOutlined />,
      label: <Link to="/admin/warranty">Warranty</Link>,
    },
    {
      key: '/admin/product-features',
      icon: <ToolOutlined />,
      label: <Link to="/admin/product-features">Product Features</Link>,
    },
  ];

  const menu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={() => {
        localStorage.removeItem('token');
        navigate('/login');
        window.location.reload();
      }}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="!min-h-screen">
      {/* Sidebar */}
      <Sider breakpoint="lg" collapsedWidth="0" className="bg-gray-800">
        <p className="!text-white text-xl font-bold text-center py-4">
          Admin Panel
        </p>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>

      {/* Main layout */}
      <Layout>
        {/* Header */}
        <Header className="bg-white px-6 flex justify-end items-center shadow">
          <div className="flex items-center gap-3">
            <Dropdown overlay={menu} placement="bottomRight" arrow>
              <div className="flex items-center gap-3 cursor-pointer select-none">
                <Avatar src={user.avatarUrl}>
                  {!user.avatarUrl && dataInfo?.username?.charAt(0)?.toUpperCase()}
                </Avatar>
                <span className="font-medium text-white">{dataInfo?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content className="p-6 bg-gray-100 !max-h-[calc(100vh-64px)] overflow-auto">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
