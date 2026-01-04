import React, { useEffect, useState } from 'react';
import { Button, Card, Result, Typography, Divider, Row, Col } from "antd";
import { getDetailTransactionApi } from '../../api/transaction';
import { useParams, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const OrderSuccess: React.FC = () => {
  const [dataTransaction, setDataTransaction] = useState<any>(null);
  const router = useNavigate();
  const urlImg = import.meta.env.VITE_API_IMG_URL;
  const { id } = useParams();

  useEffect(() => {
    const callApiOrderSuccess = async () => {
      const result = await getDetailTransactionApi(id)
      if (result?.success) {
        setDataTransaction(result?.data);
      }
    }
    callApiOrderSuccess()
  }, [])

  return (
    <div className="over">
      <div className="ctnCustom">
        <div className="bg-gray-100 min-h-screen p-6 md:p-12 w-full">
          <div className="max-w-screen-xl mx-auto grid md:grid-cols-3 gap-6">
            {/* Left - Thông tin mua hàng */}
            <div className="md:col-span-2 space-y-4">
              <Result
                status="success"
                title="Cảm ơn bạn đã đặt hàng"
                subTitle=""
              />
              <Card className="grid grid-cols-1 gap-4">
                <div>
                  <Title level={5}>Thông tin đơn hàng</Title>
                  <Row gutter={[8, 8]} className="mb-4">
                    <Col span={24}>
                      <Text>Mã đơn hàng: {dataTransaction?.code}</Text>
                    </Col>
                    <Col span={24}>
                      <Text>Tên người nhận: {dataTransaction?.userName}</Text>
                    </Col>
                    <Col span={24}>
                      <Text>Email: {dataTransaction?.email}</Text>
                    </Col>
                  </Row>

                  <Divider className="my-2" />
                  <Title level={5}>Phương thức thanh toán</Title>
                  {
                    dataTransaction?.paymentMethod === 'vnpay' ? (
                      <Text type="success">Thanh toán bằng vnpay</Text>
                    ) : (
                      <Text type="success">Thanh toán khi giao hàng (COD)</Text>
                    )
                  }
                </div>

                <div className='mt-6'>
                  <Title level={5}>Địa chỉ nhận hàng</Title>
                  <Text>{dataTransaction?.address}</Text><br />

                  <Divider className="my-2" />
                  <Title level={5}>Phương thức vận chuyển</Title>
                  <Text>Giao hàng tận nơi</Text>
                </div>
              </Card>
            </div>

            {/* Right - Đơn hàng */}
            <Card title="Đơn hàng của bạn" >
              {
                dataTransaction?.details?.map((item: any) => {
                  var images = item?.productImages?.split(',');
                  return (
                    <div className="flex gap-4 mb-4" key={item?._id}>
                      <img src={urlImg + '/' + images[0]} alt={item?.productName} className="object-contain w-14 h-14" />
                      <div>
                        <Text strong>{item?.productName}</Text><br />
                        <Text>Số lượng: {item?.number}</Text><br />
                        <Text>{new Intl.NumberFormat('vi-VN').format(item?.unitPrice)}₫</Text><br />
                      </div>
                    </div>
                  )
                })
              }

              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <Text>Tạm tính</Text>
                  <Text>{new Intl.NumberFormat('vi-VN').format(dataTransaction?.totalPrice)}₫</Text>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <Text>Tổng cộng</Text>
                  <Text className="text-blue-600">{new Intl.NumberFormat('vi-VN').format(dataTransaction?.totalPrice)}₫</Text>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={() => router('/')} type="primary" className="px-6">Tiếp tục mua hàng</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
};

export default OrderSuccess;
