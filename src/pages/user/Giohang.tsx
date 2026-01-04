import React, { useEffect, useState } from 'react';
import {
  Input, Button, Radio, Typography, Divider, Form, Image, Card, message,
  InputNumber,
} from 'antd';
import { createTransactionApi } from '../../api/transaction';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart, setToCart } from '../../redux/cartSlice';

const { Title, Text } = Typography;

const Giohang: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [cart, setCart] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    phone: "",
    address: "",
    note: "",
    paymentMethod: "cod",
  });
  const urlImg = import.meta.env.VITE_API_IMG_URL;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handelOrder = async () => {
    var dataForm = {
      ...form,
      totalPrice: cart.reduce((total, item) => {
        return total + (item.promotionalPrice != null ? item.promotionalPrice : 0) * item.quantity;
      }
        , 0),
      details: cart.map((item: any) => ({
        productId: item._id,
        number: item.quantity,
        unitPrice: item.promotionalPrice != null ? item.promotionalPrice : 0,
        totalPrice: (item.promotionalPrice != null ? item.promotionalPrice : 0) * item.quantity,
      })),
    }

    try {
      const response = await createTransactionApi(dataForm);
      if (response.success === true) {
        dispatch(clearCart());
        if (response?.paymentUrl) {
          window.location.href = response.paymentUrl;
        } else {
          message.success('Đặt hàng thành công!');
          navigate(`/order-success/${response?.data?.code}`);
        }
      } else {
        message.error('Đặt hàng thất bại, vui lòng thử lại sau.');
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Đặt hàng thất bại, vui lòng thử lại sau.');
    }

  }

  const updateQuantity = (index: number, value: number) => {
    const newQuantity = Math.max(1, parseInt(value as any, 10) || 1);
    const updatedCart = cart.map((item, i) =>
      i === index ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart)
    dispatch(setToCart(updatedCart));
  };

  const removeItem = (index: any) => {
    var updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
    dispatch(setToCart(updatedCart));
  };

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'))
    setForm({
      ...form,
      email: JSON.parse(localStorage.getItem('userProfile') || '{}').email || "",
      fullName: JSON.parse(localStorage.getItem('userProfile') || '{}').fullName || "",
      phone: JSON.parse(localStorage.getItem('userProfile') || '{}').phone || "",
      address: JSON.parse(localStorage.getItem('userProfile') || '{}').address || "",
    })
  }, []);

  useEffect(() => {
    const total = cart.reduce((sum, item) => {
      return sum + (item.promotionalPrice != null ? item.promotionalPrice : 0) * item.quantity;
    }, 0);
    setTotalPrice(total);
  }, [cart]);

  return (
    <div className="over bg-gray-50 min-h-screen py-8">
      <div className="ctnCustom max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-0">

          {/* Thông tin nhận hàng */}
          <Card className="md:col-span-1" title={<Title level={4}>Thông tin nhận hàng</Title>}>
            <Form layout="vertical">
              <Form.Item label="Email">
                <Input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
              </Form.Item>

              <Form.Item label="Họ và tên">
                <Input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Họ và tên" />
              </Form.Item>

              <Form.Item label="Số điện thoại">
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Số điện thoại"
                  suffix={<Image src="https://flagcdn.com/w40/vn.png" preview={false} width={24} />}
                />
              </Form.Item>

              <Form.Item label="Địa chỉ">
                <Input name="address" value={form.address} onChange={handleChange} placeholder="Số nhà, tên đường..." />
              </Form.Item>

              <Form.Item label="Ghi chú (tuỳ chọn)">
                <Input.TextArea name="note" value={form.note} onChange={handleChange} rows={4} />
              </Form.Item>
            </Form>
          </Card>

          {/* Đơn hàng */}
          <Card title={<Title level={4}>Đơn hàng</Title>} className="space-y-4">
            {cart.length === 0 ? (
              <Text type="secondary">Giỏ hàng của bạn đang trống.</Text>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="flex flex-col">
                  <div className="flex gap-4 items-start">
                    <Image
                      src={urlImg + '/' + item?.images?.split(',')[0]}
                      alt={item.name}
                      width={64}
                      height={64}
                      preview={false}
                    />
                    <div className="flex-1">
                      <Text strong>{item.name}</Text>
                      <div className="mt-1">
                        <Text type="secondary">Số lượng: </Text>
                        <InputNumber
                          min={1}
                          value={item.quantity}
                          onChange={(value) => updateQuantity(index, value)}
                          size="small"
                        />
                      </div>
                      <div className="mt-1">
                        <Text strong className="text-blue-600">
                          {item.promotionalPrice != null
                            ? `${new Intl.NumberFormat('vi-VN').format(item.promotionalPrice)}₫`
                            : 'Liên hệ'}
                        </Text>
                      </div>
                    </div>
                    <Button danger size="small" onClick={() => removeItem(index)}>
                      Xoá
                    </Button>
                  </div>
                  <Divider />
                </div>
              ))
            )}

            <div>
              <div className="flex justify-between text-sm">
                <Text>Phí vận chuyển</Text>
                <Text>-</Text>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <Text>Tạm tính</Text>
                <Text>{new Intl.NumberFormat('vi-VN').format(totalPrice)}₫</Text>
              </div>
              <Divider />
              <div className="flex justify-between text-lg font-semibold">
                <Text strong>Tổng cộng</Text>
                <Text type="danger" strong>{new Intl.NumberFormat('vi-VN').format(totalPrice)}₫</Text>
              </div>
            </div>

            <div>
              <Text strong className="mb-2 block">Hình thức thanh toán</Text>
              <Radio.Group
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              >
                <Radio value="cod">Thanh toán khi nhận hàng (COD)</Radio>
                <Radio value="vnpay" className='mt-2'>Thanh toán qua thẻ ngân hàng (VNPAY)</Radio>
              </Radio.Group>
            </div>

            <Button disabled={cart.length === 0} onClick={handelOrder} type="primary" block size="large" className="!bg-blue-600 hover:!bg-blue-700 mt-5">
              Đặt hàng
            </Button>

            <a href="/" className="block text-center text-blue-500 underline text-sm mt-2">
              &lt; Quay về trang chủ
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Giohang;
