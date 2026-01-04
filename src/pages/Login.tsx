import React from 'react';
import { Button, Form, Input, message, Card, Typography } from 'antd';
import { LoginApi } from '../api/users';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const onFinish = async (values: any) => {
    try {
      const result = await LoginApi(values);
      localStorage.setItem('token', result?.token);
      localStorage.setItem('role', result?.role);
      if (result?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      window.location.reload()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-lg" bordered={false}>
        <Title level={3} className="text-center mb-6">Đăng nhập</Title>
        <Form
          name="loginForm"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input placeholder="Nhập tên đăng nhập" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block className="hover:bg-blue-600">
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
