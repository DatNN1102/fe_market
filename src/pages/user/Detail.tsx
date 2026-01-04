import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../component/Breadcrumb';
import { ShoppingCartOutlined, StarFilled } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { getProductDetailApi } from '../../api/products';
import { Avatar, Button, Form, Image, Input, message, Modal, Progress, Rate, Typography } from 'antd';
import DOMPurify from 'dompurify';
import { createEvaluateApi, getEvaluateByProductApi } from '../../api/evaluate';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import { addToCart as addToCartAction } from '../../redux/cartSlice';
import TryOnModal from '../../component/TryOnModal';

const Detail: React.FC = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const urlImg = import.meta.env.VITE_API_IMG_URL;
  const [quantity, setQuantity] = useState(1);
  const [dataProductDetail, setDataProductDetail] = useState<any>({});
  const [evaluate, setEvaluate] = useState<any>([])
  const [listStar, setListStar] = useState<any>([])
  const [totalStar, setTotalStar] = useState<any>([])
  const [breadcrumbItems, setBreadcrumbItems] = useState<any>([])
  const images = dataProductDetail?.images?.split(',') || [];
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const { Text, Paragraph } = Typography;
  const storedProfile = localStorage.getItem('userProfile');
  const userProfile = storedProfile ? JSON.parse(storedProfile) : {};

  const [form] = Form.useForm();
  const [star, setStar] = useState(0);
  const [open, setOpen] = useState(false);
  const [isTryOnModalOpen, setIsTryOnModalOpen] = useState(false);

  const showTryClothes = () => {
    setIsTryOnModalOpen(true);
  };

  const submitAddEvaluate = async (values: any) => {
    if (star === 0) {
      message.error('Vui lòng chọn đánh giá sao');
      return;
    }
    const result = await createEvaluateApi({
      ...values,
      starRating: star,
      productID: dataProductDetail._id
    });
    if (result?.success) {
      setOpen(false);
      message.success('Gửi đánh giá thành công!');
      form.resetFields();
      setStar(0);
      getEvaluateByProduct()
    } else {
      message.error('Gửi đánh giá không thành công!');
    }
  };

  const openDialogAddEvaluate = () => {
    form.setFieldsValue(userProfile);
    setOpen(true)
  }

  const { TextArea } = Input;

  const addToCart = () => {
    const cartItem = { ...dataProductDetail, quantity };
    dispatch(addToCartAction(cartItem)); // Update Redux
    message.success('Đã thêm sản phẩm vào giỏ hàng');
    setQuantity(1);
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, []);

  const getEvaluateByProduct = async () => {
    const result = await getEvaluateByProductApi(dataProductDetail._id)
    if (result?.success) {
      setEvaluate(result?.data)
      var listStarTemp = result?.data?.map((item: any) => {
        return item?.starRating
      })
      var ratingStatsTemp = [
        { star: 5, count: listStarTemp.filter((item: any) => item === 5).length },
        { star: 4, count: listStarTemp.filter((item: any) => item === 4).length },
        { star: 3, count: listStarTemp.filter((item: any) => item === 3).length },
        { star: 2, count: listStarTemp.filter((item: any) => item === 2).length },
        { star: 1, count: listStarTemp.filter((item: any) => item === 1).length },
      ]
      setTotalStar(ratingStatsTemp?.reduce((acc: any, curr: any) => acc + curr.count, 0))
      setListStar(ratingStatsTemp)
    }
  }

  useEffect(() => {
    if (!selectedImage) {
      setSelectedImage(dataProductDetail?.images?.split(',')[0]);
    }
    getEvaluateByProduct()
  }, [dataProductDetail]);

  useEffect(() => {
    const fetchProductDetail = async () => {
      const response = await getProductDetailApi(id);
      setDataProductDetail(response?.data);
      setBreadcrumbItems([{ label: response?.data?.name }])
    }
    fetchProductDetail()
  }, []);

  return (
    <div className='over'>
      <Breadcrumb items={breadcrumbItems} />
      <div className='ctnCustom pt-6'>
        <div className="w-full grid grid-cols-1 md:grid-cols-24 gap-8">
          {/* Left: Image */}
          <div className="md:col-span-8">
            <Image.PreviewGroup
              items={images.map((img: any) => `${urlImg}/${img}`)}
            >
              {/* Ảnh chính */}
              <Image
                src={`${urlImg}/${selectedImage}`}
                alt="Ảnh sản phẩm"
                className="w-full rounded"
              />

              {/* Thumbnails */}
              <div className="flex gap-2 mt-2">
                {images.map((img: any, i: any) => (
                  <Image
                    key={i}
                    src={`${urlImg}/${img}`}
                    alt={`Thumbnail ${i + 1}`}
                    onClick={() => setSelectedImage(img)}
                    width={64}
                    height={64}
                    preview={false}
                    className={`rounded border cursor-pointer object-cover ${img === selectedImage ? 'border-blue-500' : 'border-gray-300'
                      }`}
                  />
                ))}
              </div>
            </Image.PreviewGroup>
          </div>

          {/* Right: Info */}
          <div className="md:col-span-10 space-y-4">
            <h1 className="text-2xl font-semibold">{dataProductDetail.name}</h1>
            {/* <div className="text-sm text-gray-500">Mã: Đang cập nhật</div> */}
            {/* <div className="text-sm text-gray-500">
              Thương hiệu: <span className="text-black">Baseus</span> | Tình trạng: <span className="text-black">Còn hàng</span>
            </div> */}

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-red-600 text-2xl font-bold">{dataProductDetail?.promotionalPrice?.toLocaleString('vi-VN')}₫</span>
              {
                dataProductDetail?.promotionalPrice !== dataProductDetail?.realPrice &&
                <span className="line-through text-gray-400 text-lg">{dataProductDetail?.realPrice?.toLocaleString('vi-VN')}₫</span>
              }
            </div>

            {/* Features */}
            <ul className="text-sm space-y-1 text-gray-700">
              <li>✅ Tình trạng mới 100% nguyên hộp</li>
              <li>✅ Sản phẩm chính hãng</li>
              {
                dataProductDetail?.warrantyPeriod &&
                <li>✅ Bảo hành chính hãng {dataProductDetail?.warrantyPeriod} tháng</li>
              }
            </ul>

            {/* Quantity */}
            <div className="flex items-center space-x-3">
              <span>Số lượng:</span>
              <div className="flex border rounded overflow-hidden">
                <button className="w-8 h-8" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <div className="w-10 h-8 flex justify-center items-center border-x">{quantity}</div>
                <button className="w-8 h-8" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-4">
              <button onClick={showTryClothes} className="bg-black text-white px-6 py-3 rounded font-semibold hover:opacity-90">
                Thử đồ
              </button>
              <button className="border border-red-500 text-red-500 px-6 py-3 rounded hover:bg-red-50 flex items-center space-x-2" onClick={addToCart}>
                <ShoppingCartOutlined />
                <span>Thêm vào giỏ</span>
              </button>
            </div>
          </div>

          {/* Chính sách hỗ trợ */}
          <div className="md:col-span-6 mt-4">
            <div className="w-full border p-4 rounded space-y-3 border-[#ddd] shadow-sm">
              <div className="font-semibold">✅ Chính sách hỗ trợ</div>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start space-x-2">
                  <img src={`/public/free_ship.svg`} alt="truck" className="w-9 h-9 mt-0.5" />
                  <div><strong>Vận chuyển miễn phí</strong><br />Hóa đơn trên 5 triệu</div>
                </li>
                <li className="flex items-start space-x-2">
                  <img src={`/public/gift.svg`} alt="gift" className="w-9 h-9 mt-0.5" />
                  <div><strong>Quà tặng</strong><br />Hóa đơn trên 10 triệu</div>
                </li>
                <li className="flex items-start space-x-2">
                  <img src={`/public/product_policy.svg`} alt="medal" className="w-9 h-9 mt-0.5" />
                  <div><strong>Chứng nhận chất lượng</strong><br />Sản phẩm chính hãng</div>
                </li>
                <li className="flex items-start space-x-2">
                  <img src={`/public/hotline.svg`} alt="support" className="w-9 h-9 mt-0.5" />
                  <div><strong>Hotline: 1900 6750</strong><br />Hỗ trợ 24/7</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="ctnCustom !mb-10">
        <div className="bg-gray-50 p-6 rounded-xl shadow-sm mt-6 w-full">
          <h2 className="text-xl md:text-2xl font-bold mb-4">THÔNG TIN SẢN PHẨM</h2>
          <div className="ql-editor editer_custom"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataProductDetail?.detail || '') }}
          ></div>
        </div>
      </div>
      <div className="ctnCustom w-full pb-4">
        <div className="border border-[#ddd] rounded-md p-4 flex items-center justify-between w-full shadow-sm bg-white">
          {/* Cột trung bình */}
          <div className="flex flex-col items-center justify-center w-52 ">
            <div className='flex gap-2 items-center'>
              <div className="text-orange-500 text-4xl font-bold">{
                totalStar > 0
                  ? (listStar.reduce((acc: number, curr: any) => acc + curr.star * curr.count, 0) / totalStar).toFixed(1)
                  : '0'
              }</div>
              <div className="text-orange-500">
                <StarFilled />
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-1 text-center">ĐÁNH GIÁ TRUNG BÌNH</div>
          </div>

          {/* Cột thanh đánh giá */}
          <div className="flex-1 px-4">
            {listStar.map((rate: any) => {
              const percent = totalStar === 0 ? 0 : Math.round((rate.count / totalStar) * 100);
              return (
                <div key={rate.star} className="flex items-center mb-1">
                  <span className="w-6 text-sm font-medium text-gray-600">{rate.star}★</span>
                  <div className="flex-1 mx-2">
                    <Progress
                      percent={percent}
                      strokeColor="#f59e0b"
                      showInfo={false}
                      size="small"
                    />
                  </div>
                  <span className="text-sm text-blue-600">{percent}% | {rate.count} đánh giá</span>
                </div>
              );
            })}
          </div>

          {/* Cột nút */}
          <div className=" w-52 text-center">
            <Button onClick={openDialogAddEvaluate} type="primary" size="large" className="bg-blue-500">
              ĐÁNH GIÁ NGAY
            </Button>
          </div>
        </div>
      </div>
      <div className='ctnCustom w-full mt-6 flex-col gap-2'>
        {
          evaluate?.map((item: any) => {
            return (
              <div className="w-full p-4 border-[#ddd] !my-4 bg-white rounded-md shadow-sm flex-col" key={item?._id}>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Avatar size="small" style={{ backgroundColor: '#87d068' }}>
                    T
                  </Avatar>
                  <Text className="text-gray-800">{item?.fullName}</Text>
                </div>
                <div className="mt-1 flex flex-col gap-1">
                  <Rate disabled defaultValue={item?.starRating} style={{ fontSize: 14, color: '#f59e0b' }} />
                  <Paragraph className="text-gray-700 text-sm">
                    {item?.contentEvaluate}
                  </Paragraph>
                  <span>{item?.createdAt ? dayjs(item.createdAt).format('HH:mm DD-MM-YYYY') : ''}</span>
                </div>
              </div>
            )
          })
        }
      </div>
      <TryOnModal 
        visible={isTryOnModalOpen} 
        onClose={() => setIsTryOnModalOpen(false)}
        productImage={`${urlImg}/${selectedImage}`} 
      />
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
        title={
          <span className="font-semibold text-lg">
            Đánh giá sản phẩm
          </span>
        }
        className="w-full max-w-2xl"
      >
        <Form layout="vertical" form={form} onFinish={submitAddEvaluate}>
          {/* Nội dung cảm nhận */}
          <Form.Item
            name="contentEvaluate"
            rules={[{ required: true, message: 'Vui lòng nhập cảm nhận.' }]}
          >
            <TextArea
              rows={4}
              placeholder="Mời bạn chia sẻ thêm một số cảm nhận..."
            />
          </Form.Item>

          <div className="mb-4">
            <p className="text-sm font-medium">Bạn cảm thấy thế nào về sản phẩm? (Chọn sao)</p>
            <Rate
              value={star}
              onChange={setStar}
              tooltips={['Rất tệ', 'Không tệ', 'Trung bình', 'Tốt', 'Tuyệt vời']}
              style={{ color: '#f59e0b' }}
            />
            {star > 0 && (
              <span className="ml-2 text-gray-600 text-sm italic">
                {['Rất tệ', 'Không tệ', 'Trung bình', 'Tốt', 'Tuyệt vời'][star - 1]}
              </span>
            )}
          </div>

          {/* Thông tin người dùng */}
          <div className="grid grid-cols-1 md:grid-cols-1">
            <Form.Item name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên.' }]}>
              <Input size='large' placeholder="Họ tên*" />
            </Form.Item>
            <Form.Item name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại.' }]}>
              <Input size='large' placeholder="Số điện thoại*" />
            </Form.Item>
            <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ.' }]}>
              <Input size='large' placeholder="Email*" />
            </Form.Item>
          </div>

          {/* Nút gửi */}
          <Form.Item>
            <Button size='large' htmlType="submit" type="primary" block className="bg-blue-500">
              GỬI ĐÁNH GIÁ
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
};

export default Detail;
