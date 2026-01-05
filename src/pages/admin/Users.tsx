import React, { useEffect, useState } from 'react';
import {
  Table, Button, Space, Tag, Input, message, Modal, Form, Input as AntInput, Select, Descriptions
} from 'antd';
import { getUserApi } from '../../api/users';

const { Option } = Select;

const Users: React.FC = () => {
  const [dataUser, setDataUser] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState<string>('');

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [form] = Form.useForm();

  const fetchUsers = async (pageUser: number, limitUser: number, searchText = '') => {
    try {
      const result = await getUserApi({ page: pageUser, limit: limitUser, search: searchText });
      setDataUser(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Lỗi tải danh sách người dùng:', error);
      message.error('Không thể tải danh sách người dùng');
    }
  };

  useEffect(() => {
    fetchUsers(page, limit, search);
  }, [page, limit, search]);

  const handleView = (user: any) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  // const handleEdit = (user: any) => {
  //   setSelectedUser(user);
  //   form.setFieldsValue(user);
  //   setEditModalOpen(true);
  // };

  const handleSaveEdit = () => {
    form.validateFields().then(() => {
      setEditModalOpen(false);
      message.success('Đã lưu thay đổi (chưa gọi API)');
    });
  };

  const columns = [
    { title: 'User Name', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'geekblue' : 'green'}>{role.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'volcano'}>
          {status === 1 ? 'Đang hoạt động' : 'Ngưng hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="default" onClick={() => handleView(record)}>Xem</Button>
          {/* <Button type="primary" onClick={() => handleEdit(record)}>Sửa</Button> */}
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Danh sách người dùng</h1>
      </div>

      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Tìm theo tên..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ width: 250 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={dataUser}
        rowKey="_id"
        pagination={{
          current: page,
          pageSize: limit,
          total: total,
          onChange: (newPage, newSize) => {
            setPage(newPage);
            setLimit(newSize);
          },
        }}
      />

      {/* Modal XEM thông tin */}
      <Modal
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
        title="Chi tiết người dùng"
      >
        {selectedUser && (
          <Descriptions
            bordered
            column={1}
            size="middle"
            labelStyle={{ fontWeight: 'bold', width: 150 }}
          >
            <Descriptions.Item label="Họ tên">{selectedUser.fullName}</Descriptions.Item>
            <Descriptions.Item label="Username">{selectedUser.username}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedUser.email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{selectedUser.phone}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{selectedUser.address}</Descriptions.Item>
            <Descriptions.Item label="Vai trò">
              <Tag color={selectedUser.role === 'admin' ? 'geekblue' : 'green'}>
                {selectedUser.role.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={selectedUser.status === 1 ? 'green' : 'volcano'}>
                {selectedUser.status === 1 ? 'Đang hoạt động' : 'Ngưng hoạt động'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{new Date(selectedUser.createdAt).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">{new Date(selectedUser.updatedAt).toLocaleString()}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Modal SỬA thông tin */}
      <Modal
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleSaveEdit}
        title="Chỉnh sửa người dùng"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
            <AntInput />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
            <AntInput />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <AntInput />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <AntInput />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Option value={1}>Đang hoạt động</Option>
              <Option value={0}>Ngưng hoạt động</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
