import React, { useEffect, useState } from 'react';
import { Input, Table, Tag, Button, Space, Modal, Descriptions, Dropdown, message } from 'antd';
import { getTransactionApi, updateTransactionApi } from '../../api/transaction';
import moment from 'moment';

const Orders: React.FC = () => {
  const [dataTransaction, setDataTransaction] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchCode, setSearchCode] = useState('');


  const paymentOptions = [
    { label: 'Đã thanh toán', value: true, color: 'green' },
    { label: 'Chưa thanh toán', value: false, color: 'red' },
  ];

  const statusOptions = [
    { label: 'Đã giao', value: 0, color: 'green' },
    { label: 'Chờ xử lý', value: 1, color: 'blue' },
    { label: 'Đã huỷ', value: 2, color: 'red' },
  ];

  const confirmUpdateField = (record: any, field: string, value: any, label: string) => {
    Modal.confirm({
      title: 'Xác nhận thay đổi',
      content: `Bạn có chắc muốn thay đổi ${field === 'isPaid' ? 'trạng thái thanh toán' : 'trạng thái đơn hàng'} sang "${label}" không?`,
      okText: 'Có',
      cancelText: 'Không',
      onOk: () => {
        handleUpdateField(record, field, value);
      },
    });
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (totalPrice: number) => (
        <span>{totalPrice.toLocaleString('vi-VN')}₫</span>
      ),
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) =>
        method === 'vnpay' ? 'VNPay' : method === 'cod' ? 'Thanh toán khi nhận hàng' : method,
    },
    {
      title: 'Thanh toán',
      dataIndex: 'isPaid',
      key: 'isPaid',
      render: (isPaid: boolean, record: any) => {
        return (
          <Dropdown
            trigger={['click']}
            menu={{
              items: paymentOptions.map((opt: any) => ({
                key: String(opt.value),
                label: (
                  <span
                    onClick={() =>
                      confirmUpdateField(record, 'isPaid', opt.value, opt.label)
                    }
                  >
                    {opt.label}
                  </span>
                )
              }))
            }}
          >
            <Tag color={isPaid ? 'green' : 'red'} className="cursor-pointer">
              {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </Tag>
          </Dropdown>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: number, record: any) => {
        const current = statusOptions.find((opt: any) => opt.value === status);
        return (
          <Dropdown
            trigger={['click']}
            menu={{
              items: statusOptions.map((opt: any) => ({
                key: String(opt.value),
                label: (
                  <span
                    onClick={() =>
                      confirmUpdateField(record, 'status', opt.value, opt.label)
                    }
                  >
                    {opt.label}
                  </span>
                )
              }))
            }}
          >
            <Tag color={current?.color} className="cursor-pointer">
              {current?.label}
            </Tag>
          </Dropdown>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="primary" onClick={() => handleView(record)}>Xem</Button>
        </Space>
      ),
    },
  ];

  const handleUpdateField = async (record: any, field: string, value: any) => {
    try {
      // Nếu field là status và chọn "Đã giao" thì auto isPaid = true
      let updatedData: any = { [field]: value };
      if (field === 'status' && value === 0) {
        updatedData.isPaid = true;
      }
      await updateTransactionApi(record._id, updatedData);
      const updatedList = dataTransaction.map(item =>
        item._id === record._id
          ? { ...item, ...updatedData }
          : item
      );
      setDataTransaction(updatedList);
      message.success('Cập nhật thành công!');
    } catch (error) {
      message.error('Cập nhật thất bại!');
    }
  };

  const handleView = (record: any) => {
    setSelectedOrder(record);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getTransactionApi({ page, limit, code: searchCode });
        setDataTransaction(result.data);
        setTotal(result.total);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [page, limit, searchCode]);

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Danh sách đơn hàng</h1>
        <Input.Search
          placeholder="Tìm theo mã đơn hàng"
          allowClear
          onSearch={(value) => {
            setSearchCode(value);
            setPage(1); // reset về trang đầu tiên khi tìm
          }}
          style={{ width: 300 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={dataTransaction}
        pagination={{
          current: page,
          pageSize: limit,
          total: total,
          onChange: (newPage, newPageSize) => {
            setPage(newPage);
            setLimit(newPageSize);
          },
        }}
        rowKey="_id"
      />

      <Modal
        open={isModalOpen}
        title="Chi tiết đơn hàng"
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        width={'80%'}
      >
        {selectedOrder && (
          <Descriptions bordered column={2} size="middle" labelStyle={{ fontWeight: 'bold' }}>
            <Descriptions.Item label="Mã đơn">{selectedOrder.code}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedOrder.email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{selectedOrder.phone}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{selectedOrder.address}</Descriptions.Item>
            <Descriptions.Item label="Phương thức thanh toán">
              {selectedOrder.paymentMethod === 'vnpay'
                ? 'VNPay'
                : selectedOrder.paymentMethod === 'cod'
                  ? 'Thanh toán khi nhận hàng'
                  : selectedOrder.paymentMethod}
            </Descriptions.Item>
            <Descriptions.Item label="Tình trạng thanh toán">
              <Tag color={selectedOrder.isPaid ? 'green' : 'red'}>
                {selectedOrder.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              {selectedOrder.totalPrice.toLocaleString('vi-VN')}₫
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={
                selectedOrder.status === 0 ? 'green' :
                  selectedOrder.status === 1 ? 'blue' : 'red'
              }>
                {selectedOrder.status === 0
                  ? 'Đã giao'
                  : selectedOrder.status === 1
                    ? 'Chờ xử lý'
                    : 'Đã huỷ'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">{selectedOrder.note || 'Không có'}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {moment(selectedOrder.createdAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">
              {moment(selectedOrder.updatedAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
