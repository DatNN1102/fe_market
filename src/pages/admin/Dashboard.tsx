import React, { useState, useEffect } from 'react';
import { Card, Statistic, DatePicker, Row, Col, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, type TooltipProps } from 'recharts';
import dayjs from 'dayjs';
import { getStatisticsApi } from '../../api/statistics';

const { Title } = Typography;
const { MonthPicker } = DatePicker;

// Dữ liệu mẫu
const revenueData = [
  { month: 'Jan', revenue: 1200 },
  { month: 'Feb', revenue: 2100 },
  { month: 'Mar', revenue: 3200 },
  { month: 'Apr', revenue: 2500 },
  { month: 'May', revenue: 3800 },
  { month: 'Jun', revenue: 1900 },
  { month: 'Jul', revenue: 3000 },
  { month: 'Aug', revenue: 2700 },
  { month: 'Sep', revenue: 3300 },
  { month: 'Oct', revenue: 2900 },
  { month: 'Nov', revenue: 4100 },
  { month: 'Dec', revenue: 4500 },
];

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(500);
  const [dataDetail, setDataDetail] = useState<any>([]);

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('vi-VN') + ' ₫';
  };

  // Tooltip tùy chỉnh
  const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded shadow text-sm">
          <p className="font-semibold">{label}</p>
          <p>Doanh thu: <span className="font-medium">{formatCurrency(Number(payload[0].value))}</span></p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    callAPiStatistics()
  }, [selectedMonth]);

  const callAPiStatistics = async () => {
    var params = {
      type: 'monthly',
      from: selectedMonth.format('MM-YYYY'),
    }
    const result = await getStatisticsApi(params);
    if (result.success) {
      setMonthlyRevenue(result.data.totalSold);
      setTotalRevenue(result.data.totalRevenue);
      setTotalOrders(result.data.totalTransactions);
      var chartData = Object.entries(result?.data?.details)?.map(([day, data]: any) => ({
        day: `Ngày ${day}`,
        ...data
      }));
      setDataDetail(chartData);
    } else {
      console.error('Error fetching statistics:', result.message);
    }
  }

  useEffect(() => {
    const total = revenueData.reduce((acc, item) => acc + item.revenue, 0);
    setTotalRevenue(total);
    callAPiStatistics()
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <Title level={3}>Dashboard Doanh thu</Title>
        <MonthPicker
          onChange={(date) => setSelectedMonth(date || dayjs())}
          defaultValue={selectedMonth}
          format="MM-YYYY"
          allowClear={false}
          disabledDate={(current) => current && current > dayjs().endOf('month')}
        />
      </div>

      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic title="Tổng doanh thu" value={totalRevenue} suffix="₫" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Tổng sản phẩm" value={monthlyRevenue} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Tổng đơn hàng" value={totalOrders} />
          </Card>
        </Col>
      </Row>

      <Card title="Doanh thu theo ngày trong tháng">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataDetail}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis tickFormatter={(value) => `${value.toLocaleString('vi-VN')} ₫`} width={80} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalRevenue" fill="#13c2c2" name="Doanh thu" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default Dashboard;
