import React, { useEffect, useState } from 'react';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useDispatch } from 'react-redux';
import { addToCart as addToCartAction } from '../redux/cartSlice';

interface ProductProps {
  images: string;
  name: string;
  realPrice: number;
  promotionalPrice: number;
}

const ProductCard: React.FC<ProductProps> = ({
  images,
  name,
  realPrice,
  promotionalPrice,
  ...item
}: any) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const urlImg = import.meta.env.VITE_API_IMG_URL;
  const [imgShow, setImgShow] = useState<string>('');
  const handleAddToCart = () => {
    var cartItem = {
      name: name,
      realPrice: realPrice,
      promotionalPrice: promotionalPrice,
      images: images,
      ...item,
      quantity: 1
    }
    dispatch(addToCartAction(cartItem));
    message.success('Đã thêm sản phẩm vào giỏ hàng');
  }

  const getDetail = () => {
    navigate(`/detail/${item?._id}`);
  };

  useEffect(() => {
    const imageArray = images?.split(',');
    setImgShow(urlImg + '/' + imageArray[0]);
  }, []);
  return (
    <div className="relative bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition">
      {realPrice !== promotionalPrice && (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded z-10 font-semibold">
          Giảm {Math.round(((realPrice - promotionalPrice) / realPrice) * 100)}%
        </div>
      )}

      {/* Ảnh sản phẩm */}
      <div className="w-full aspect-[4/5] overflow-hidden" onClick={getDetail}>
        {
          images ?
            (
              <img src={imgShow} alt={name} className="object-contain w-full h-full" />
            ) :
            (
              <img src="/public/no-image.jpg" alt="no image" className="object-contain w-full h-full" />
            )
        }
      </div>

      {/* Nội dung */}
      <div className="p-3">
        <h3 className="mt-1 text-sm font-medium text-gray-800">{name}</h3>
        <div className="flex items-center gap-2 mt-1">
          {
            realPrice !== promotionalPrice && <del className="text-xs text-gray-400">{realPrice.toLocaleString()}đ</del>
          }
          <p className="text-lg font-bold text-red-600">{promotionalPrice.toLocaleString()}đ</p>
        </div>

        {/* Button mua */}
        <div className="text-right mt-2">
          <button className="bg-black text-white p-2 rounded" onClick={handleAddToCart}>
            <ShoppingCartOutlined />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
