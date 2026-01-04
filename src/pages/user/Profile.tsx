import { useEffect, useState } from "react";
import { Avatar, Button, Card, Tabs, Descriptions, Form, Input, message, Tag, Pagination, Modal, DatePicker, InputNumber, Row, Col, Select, notification, Table } from "antd";
import { EditOutlined, LockOutlined, UserOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { changeInfoApi, changePassApi } from "../../api/users";
import { getDetailTransactionApi, getMyOrderApi } from "../../api/transaction";
import { createWarrantyApi, getMyWarrantyApi } from "../../api/warranty";
import moment from "moment";

const { TabPane } = Tabs;

const Profile = () => {
  const storedProfile = localStorage.getItem('userProfile');
  const userProfile = storedProfile ? JSON.parse(storedProfile) : {};
  const PAGE_SIZE = 10;
  const [editing, setEditing] = useState(false);
  const [orders, setOrders] = useState<any>([]);
  const [total, setTotal] = useState<any>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [changingPassword, setChangingPassword] = useState(false);
  const [dialogWarranty, setDialogWarranty] = useState(false);
  const [dataSelectProduct, setDataSelectProduct] = useState([]);
  const [warranties, setWarranties] = useState<any[]>([]);
  const [totalWarranties, setTotalWarranties] = useState(0);
  const [currentWarrantyPage, setCurrentWarrantyPage] = useState(1);
  const [form] = Form.useForm();
  const [formWarranty] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [selectedWarranty, setSelectedWarranty] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleSave = async (values: any) => {
    try {
      await changeInfoApi(values);
      localStorage.setItem('userProfile', JSON.stringify({ ...userProfile, ...values }));
      message.success("Cập nhật thông tin thành công!");
      setEditing(false);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin.');
      return;
    }
  };

  const handlePasswordChange = async (values: any) => {
    try {
      await changePassApi(values);
      message.success("Đổi mật khẩu thành công!");
      passwordForm.resetFields();
      setChangingPassword(false);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
      return;
    }
  };

  const submitWarranty = async (values: any) => {
    var productSelect: any = dataSelectProduct.find((item: any) => item.productName === values?.productName)
    if (values?.numberProduct > productSelect?.number) {
      message.error('Không được chọn số lượng sản phẩm nhiều hơn đã mua');
      return
    }
    const warrantyExpiryDate = moment(productSelect.createdAt).add(productSelect.productWarrantyPeriod, 'months');
    const now = moment();
    if (now.isAfter(warrantyExpiryDate)) {
      message.error('Sản phẩm đã hết thời gian bảo hành.');
      return;
    }
    try {
      await createWarrantyApi({
        ...values,
        userID: userProfile._id,
        purchaseDate: productSelect?.createdAt,
        warrantyPeriod: productSelect?.productWarrantyPeriod,
        warrantyExpiryDate,
      })
      setDialogWarranty(false)
      message.success("Tạo bảo hành thành công. ");
    } catch (error: any) {
      message.error(error?.message || "Đơn hàng hiện tại đang có vấn đề. Hãy liên hệ lại sau.");
    }
  };

  const openDialogWarranty = async (order: any) => {
    formWarranty.setFieldsValue({
      ...order,
      customerName: order.fullName,
      purchaseDate: order.createdAt
    });
    try {
      const result = await getDetailTransactionApi(order?.code)
      setDataSelectProduct(result?.data?.details)
      setDialogWarranty(true)
    } catch (error) {
      message.error("Đơn hàng hiện tại đang có vấn đề. Hãy liên hệ lại sau.");
    }
  }

  const handleView = (record: any) => {
    setSelectedWarranty(record);
    setIsViewModalOpen(true);
  };

  const warrantyColumns = [
    {
      title: 'Mã bảo hành',
      dataIndex: 'warrantyCode',
      key: 'warrantyCode',
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'Đang xử lý' ? 'blue' :
            status === 'Đã hoàn thành' ? 'green' :
              'red'
        }>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Mô tả lỗi',
      dataIndex: 'issueDescription',
      key: 'issueDescription',
    },
    {
      title: 'Kết quả bảo hành',
      dataIndex: 'warrantyResult',
      key: 'warrantyResult',
    },
    {
      title: 'Ngày tạo bảo hành',
      dataIndex: 'TimeCreate',
      key: 'TimeCreate',
      render: (date: string) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: any) => (
        <Button type="primary" onClick={() => handleView(record)}>
          Xem
        </Button>
      ),
    },
  ];

  const fetchWarranties = async (page: number) => {
    try {
      const res = await getMyWarrantyApi();
      setWarranties(res?.data || []);
      setTotalWarranties(res?.total || 0);
    } catch (error) {
      message.error("Không thể tải lịch sử bảo hành.");
    }
  };

  const getMyOrder = async (indexPage: any) => {
    const result = await getMyOrderApi({ page: indexPage });
    setOrders(result?.data || []);
    setTotal(result?.total || 0);
  }
  useEffect(() => {
    getMyOrder(1);
    fetchWarranties(1);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card className="shadow-md rounded-2xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar
            size={100}
            icon={<UserOutlined />}
            src={userProfile?.avatar}
            className="border border-gray-300"
          />
          <div className="flex-1">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-2xl font-semibold">{userProfile.username}</h2>
              <div className="space-x-2">
                <Button icon={<EditOutlined />} onClick={() => {
                  setEditing(true);
                  setChangingPassword(false);
                  form.setFieldsValue(userProfile);
                }}>
                  Chỉnh sửa
                </Button>
                <Button icon={<LockOutlined />} onClick={() => {
                  setChangingPassword(true);
                  setEditing(false);
                }}>
                  Đổi mật khẩu
                </Button>
              </div>
            </div>
            <p className="text-gray-600">{userProfile?.email}</p>
            <p className="text-gray-600">{userProfile?.phone}</p>
          </div>
        </div>

        {/* Form sửa thông tin */}
        {editing && (
          <div className="mt-6 bg-white rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Chỉnh sửa thông tin</h2>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label="Tên người dùng" name="fullName">
                  <Input size="large" className="rounded-lg" />
                </Form.Item>

                <Form.Item label="Email" name="email">
                  <Input size="large" type="email" className="rounded-lg" />
                </Form.Item>

                <Form.Item label="Số điện thoại" name="phone">
                  <Input size="large" className="rounded-lg" />
                </Form.Item>

                <Form.Item label="Địa chỉ" name="address">
                  <Input size="large" className="rounded-lg" />
                </Form.Item>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button icon={<SaveOutlined />} type="primary" htmlType="submit">
                  Lưu
                </Button>
                <Button icon={<CloseOutlined />} onClick={() => setEditing(false)} danger>
                  Hủy
                </Button>
              </div>
            </Form>
          </div>
        )}

        {/* Form đổi mật khẩu */}
        {changingPassword && (
          <div className="mt-6 bg-white rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Đổi mật khẩu</h2>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
            >
              <div className="grid grid-cols-1 gap-4">
                <Form.Item
                  label="Mật khẩu hiện tại"
                  name="currentPassword"
                  rules={[{ required: true, message: 'Không được để trống mật khẩu hiện tại' }]}
                >
                  <Input.Password size="large" className="rounded-lg" />
                </Form.Item>

                <Form.Item
                  label="Mật khẩu mới"
                  name="newPassword"
                  rules={[{ required: true, message: 'Không được để trống mật khẩu mới' }]}
                >
                  <Input.Password size="large" className="rounded-lg" />
                </Form.Item>

                <Form.Item
                  label="Nhập lại mật khẩu mới"
                  name="confirmPassword"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Không được để trống mật khẩu mới' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject('Mật khẩu không khớp!');
                      },
                    }),
                  ]}
                >
                  <Input.Password size="large" className="rounded-lg" />
                </Form.Item>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button icon={<SaveOutlined />} type="primary" htmlType="submit">
                  Đổi mật khẩu
                </Button>
                <Button icon={<CloseOutlined />} onClick={() => setChangingPassword(false)} danger>
                  Hủy
                </Button>
              </div>
            </Form>
          </div>
        )}


        {/* Tabs chỉ hiển thị khi không chỉnh sửa */}
        {!editing && !changingPassword && (
          <Tabs defaultActiveKey="1" className="mt-6">
            <TabPane tab="Thông tin cá nhân" key="1">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="User name">{userProfile.username}</Descriptions.Item>
                <Descriptions.Item label="Họ và tên">{userProfile.fullName}</Descriptions.Item>
                <Descriptions.Item label="Email">{userProfile.email}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{userProfile.phone}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">{userProfile.address}</Descriptions.Item>
              </Descriptions>
            </TabPane>
            <TabPane tab="Lịch sử đơn hàng" key="2">
              <div className="space-y-6">
                {orders?.length === 0 ? (
                  <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
                ) : (
                  <>
                    {orders?.map((order: any) => (
                      <div
                        key={order?._id}
                        className="border border-[#ddd] rounded-2xl p-5 shadow-md flex justify-between items-start bg-white hover:shadow-lg transition-all"
                      >
                        {/* Cột trái: Thông tin đơn hàng */}
                        <div className="space-y-2 w-2/3">
                          <p><strong>Mã đơn:</strong> {order?.code} <Button onClick={() => openDialogWarranty(order)} className={order?.status !== 0 ? '!hidden' : ''}>Bảo hành</Button></p>
                          <p><strong>Ngày đặt:</strong> {new Date(order?.createdAt).toLocaleDateString('vi-VN')}</p>
                          <p><strong>Phương thức thanh toán:</strong> {order?.paymentMethod?.toUpperCase() || ''}</p>
                          <p><strong>Trạng thái đơn hàng:</strong> {
                            <Tag color={order?.status === 0 ? 'green' : order?.status === 1 ? 'blue' : 'red'}>
                              {order?.status === 0 ? 'Đã giao' : order?.status === 1 ? 'Chờ xử lý' : 'Đã huỷ'}
                            </Tag>
                          }</p>
                        </div>

                        {/* Cột phải: Tổng tiền + thanh toán */}
                        <div className="text-right w-1/3">
                          <p className="text-sm text-gray-500">Tổng tiền</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {order?.totalPrice.toLocaleString('vi-VN')}₫
                          </p>
                          <p className={`mt-2 font-medium ${order?.isPaid ? 'text-green-600' : 'text-red-500'}`}>
                            {order?.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-center pt-4">
                      <Pagination
                        current={currentPage}
                        pageSize={PAGE_SIZE}
                        total={total}
                        onChange={(page) => { setCurrentPage(page), getMyOrder(page) }}
                        showSizeChanger={false}
                      />
                    </div>
                  </>
                )}
              </div>
            </TabPane>
            <TabPane tab="Lịch sử bảo hành" key="3">
              <Table
                columns={warrantyColumns}
                dataSource={warranties}
                pagination={{
                  current: currentWarrantyPage,
                  pageSize: PAGE_SIZE,
                  total: totalWarranties,
                  onChange: (page) => {
                    setCurrentWarrantyPage(page);
                    fetchWarranties(page);
                  },
                }}
                rowKey="_id"
              />
            </TabPane>
          </Tabs>
        )}
      </Card>
      <Modal
        open={isViewModalOpen}
        title="Chi tiết đơn bảo hành"
        footer={null}
        onCancel={() => setIsViewModalOpen(false)}
        width={'80%'}
      >
        {selectedWarranty && (
          <Descriptions
            bordered
            column={2}
            size="middle"
            labelStyle={{ fontWeight: 'bold' }}
          >
            <Descriptions.Item label="Sản phẩm">{selectedWarranty.productName}</Descriptions.Item>
            <Descriptions.Item label="Mã bảo hành">{selectedWarranty.warrantyCode}</Descriptions.Item>
            <Descriptions.Item label="Số lượng">{selectedWarranty.numberProduct}</Descriptions.Item>
            <Descriptions.Item label="Khách hàng">{selectedWarranty.customerName}</Descriptions.Item>
            <Descriptions.Item label="Điện thoại">{selectedWarranty.phone}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedWarranty.email}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{selectedWarranty.address}</Descriptions.Item>
            <Descriptions.Item label="Ghi chú khách hàng">{selectedWarranty.customerNotes}</Descriptions.Item>
            <Descriptions.Item label="Ngày mua">
              {moment(selectedWarranty.purchaseDate).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hết hạn">
              {moment(selectedWarranty.warrantyExpiryDate).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Hạn bảo hành">{selectedWarranty.warrantyPeriod}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">{selectedWarranty.status}</Descriptions.Item>
            <Descriptions.Item label="Ngày nhận">
              {moment(selectedWarranty.receivedDate).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Serial Number">{selectedWarranty.serialNumber}</Descriptions.Item>
            <Descriptions.Item label="Nhân viên xử lý">{selectedWarranty.processingStaff}</Descriptions.Item>
            <Descriptions.Item label="Mô tả lỗi">{selectedWarranty.issueDescription}</Descriptions.Item>
            <Descriptions.Item label="Kết quả bảo hành">{selectedWarranty.warrantyResult}</Descriptions.Item>
            <Descriptions.Item label="Ghi chú nhân viên">{selectedWarranty.staffNotes}</Descriptions.Item>
            <Descriptions.Item label="Ngày trả">
              {selectedWarranty.returnDate ? moment(selectedWarranty.returnDate).format('DD/MM/YYYY') : 'Chưa trả'}
            </Descriptions.Item>
            <Descriptions.Item label="Tạo lúc">
              {moment(selectedWarranty.TimeCreate).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lúc">
              {moment(selectedWarranty.TimeUpdate).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
      <Modal
        title="Thông tin bảo hành"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={dialogWarranty}
        onCancel={() => setDialogWarranty(false)}
        footer={null}
        width={'50%'}
      >
        <Form form={formWarranty} layout="vertical" onFinish={submitWarranty}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Tên sản phẩm" name="productName" rules={[{ required: true }]}>
                <Select placeholder="Chọn sản phẩm">
                  {
                    dataSelectProduct?.map((item: any) => {
                      return (
                        <Select.Option key={item?._id} value={item?.productName}>{item?.productName}</Select.Option>
                      )
                    })
                  }
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Số lượng sản phẩm" name="numberProduct" rules={[{ required: true }]}>
                <InputNumber className="!w-full" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Tên khách hàng" name="customerName" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Email" name="email" rules={[{ type: 'email', required: true }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Địa chỉ" name="address" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Ghi chú" name="customerNotes" >
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <div className="flex gap-4">
              <Button onClick={() => setDialogWarranty(false)} className="w-full">
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" className="w-full">
                Gửi thông tin bảo hành
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
