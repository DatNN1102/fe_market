import React from "react";
import { Table, Tag, Button } from "antd";

const HistoryOrder: React.FC = () => {
  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      render: (text: string) => <span className="font-medium text-blue-600">#{text}</span>,
    },
    {
      title: "Ngày đặt",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = status === "Đã giao" ? "green" : status === "Đang xử lý" ? "orange" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (total: number) => <span className="font-semibold text-black">{total.toLocaleString()}₫</span>,
    },
    {
      title: "Thao tác",
      key: "action",
      render: () => <Button type="link">Xem chi tiết</Button>,
    },
  ];

  const data = [
    {
      key: "1",
      orderId: "1045",
      date: "15/05/2025",
      status: "Đã giao",
      total: 35830000,
    },
    {
      key: "2",
      orderId: "1046",
      date: "16/05/2025",
      status: "Đang xử lý",
      total: 25900000,
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Lịch sử mua hàng</h2>
      <Table columns={columns} dataSource={data} pagination={{ pageSize: 5 }} />
    </div>
  );
};

export default HistoryOrder;
