import React from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { signUpApi } from '../api/users';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const onFinish = async (values: any) => {
    try {
      await signUpApi(values);
      message.success('Đăng ký thành công!');
      navigate('/login');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi đăng ký.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Đăng ký tài khoản</h2>
        <Form
          name="signupForm"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập user name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          {/* <Form.Item name="agree" valuePropName="checked" rules={[
            {
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject(new Error('Bạn phải đồng ý điều khoản!')),
            }
          ]}>
            <Checkbox>
              Tôi đồng ý với <a href="#">điều khoản</a>
            </Checkbox>
          </Form.Item> */}

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng ký
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Signup;
