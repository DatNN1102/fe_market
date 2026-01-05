import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Badge, Dropdown, Menu } from "antd";
import { DownOutlined, FacebookFilled, HeartFilled, InstagramFilled, LoginOutlined, ShopOutlined, ShoppingCartOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hook/useAuth';
import { getProfileApi } from '../api/users';
import useInfo from '../hook/useInfo';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

const UserLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  // const { numberProduct } = useOrder();
  const navigate = useNavigate();
  const {dataInfo}: any = useInfo()
  const numberProduct = useSelector(
  (state: RootState) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0)
);
  

  // const token = localStorage.getItem('token');
  const accountMenu = (
    <Menu>
      <Menu.Item key="login" icon={<LoginOutlined />} onClick={() => {navigate('/login')}}>
        Đăng nhập
      </Menu.Item>
      <Menu.Item key="signup" icon={<UserAddOutlined />} onClick={() => navigate('/signup')}>
        Đăng ký
      </Menu.Item>
    </Menu>
  );

  useEffect(() => {
    const callApiProfile = async() => {
      const result = await getProfileApi()
      if (result.success === true) {
        localStorage.setItem('userProfile', JSON.stringify(result.data));
      } else {
        console.error('Failed to fetch user profile');
      }
    }
    callApiProfile()
  }, []);

  return (
    <div>
      <header className='over h-16 flex justify-between bg-[#212529] fixed top-0 left-0 right-0 z-50'>
        <div className='ctnCustom flex justify-between items-center text-white'>
          <div className='flex gap-4'>
            <p className='text-[42px] font-semibold cursor-pointer' onClick={() => {navigate('/')}} >DCAR</p>
            {/* <img src="/logo.webp" alt="logo" className="w-60 object-contain" onClick={() => {navigate('/')}}/> */}
          </div>
          <div className="flex items-center space-x-6">
            {/* Tài khoản dropdown */}
            {
              isAuthenticated ?
                (
                  <Dropdown overlay={
                    <Menu>
                      <Menu.Item key="profile" onClick={() => navigate('/profile')}>
                        <UserOutlined /> Hồ sơ
                      </Menu.Item>
                      <Menu.Item key="logout" onClick={() => {
                        localStorage.removeItem('token'); // Xoá token
                        navigate('/login'); // Chuyển hướng về trang đăng nhập
                        window.location.reload(); // Tải lại trang để cập nhật trạng thái
                      }}>
                        <LoginOutlined /> Đăng xuất
                      </Menu.Item>
                    </Menu>
                  } placement="bottomLeft" arrow>
                    <div className="cursor-pointer flex items-center space-x-1">
                      <UserOutlined className="text-xl" />
                      <span className="text-sm font-semibold">{dataInfo?.username}</span>
                    </div>
                  </Dropdown>
                ) :
                (
                  <Dropdown overlay={accountMenu} placement="bottomLeft" arrow>
                    <div className="cursor-pointer flex items-center space-x-1">
                      <UserOutlined className="text-xl" />
                      <span>
                        <div className="text-xs leading-none">Thông tin</div>
                        <div className="text-sm font-semibold">Tài khoản <DownOutlined className="ml-1 text-xs" /></div>
                      </span>
                    </div>
                  </Dropdown>
                )
            }
            {/* Giỏ hàng */}
            <div onClick={() => navigate('/giohang')} className="flex items-center space-x-1 cursor-pointer gap-2">
              <Badge count={numberProduct} size="small">
                <ShoppingCartOutlined className="text-xl !text-white" />
              </Badge>
              <span className="text-sm font-semibold">Giỏ hàng</span>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen mt-16">
        <Outlet />
      </main>

      <footer className="bg-black text-white text-sm">
        <div className='ctnCustom'>
          <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {/* Cột 1 */}
            <div>
              <h2 className="text-2xl font-extrabold mb-4">DCAR</h2>
              <p className="mb-4 leading-relaxed">
                Hệ thống cửa hàng DCAR chuyên vê áp suất lốp chính hãng - Giá tốt, giao miễn phí.
              </p>
              <ul className="space-y-1 text-gray-300">
                <li><strong>Địa chỉ:</strong> 70 Lữ Gia, Phường 15, Quận 11, Tp.HCM</li>
                <li><strong>Điện thoại:</strong> 1900 6750</li>
                <li><strong>Email:</strong> support@sapo.vn</li>
              </ul>
            </div>

            {/* Cột 2 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">CHÍNH SÁCH</h3>
              <ul className="space-y-2 text-gray-300">
                <li>Chính sách mua hàng</li>
                <li>Chính sách đổi trả</li>
                <li>Chính sách vận chuyển</li>
                <li>Chính sách bảo mật</li>
                <li>Cam kết cửa hàng</li>
              </ul>
            </div>

            {/* Cột 3 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">HƯỚNG DẪN</h3>
              <ul className="space-y-2 text-gray-300">
                <li>Hướng dẫn mua hàng</li>
                <li>Hướng dẫn đổi trả</li>
                <li>Hướng dẫn chuyển khoản</li>
                <li>Hướng dẫn trả góp</li>
                <li>Hướng dẫn hoàn hàng</li>
              </ul>
            </div>

            {/* Cột 4 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">KẾT NỐI VỚI CHÚNG TÔI</h3>
              <div className="flex space-x-3 text-xl mb-4">
                <FacebookFilled />
                <InstagramFilled />
                <ShopOutlined />
                <HeartFilled />
              </div>

              <h3 className="text-lg font-semibold mb-2">HỖ TRỢ THANH TOÁN</h3>
              <div className="flex flex-wrap gap-2">
                <img src={`/vn_pay.svg`} alt='vn pay' className="h-6" />
                <img src={`/atm_pay.svg`} alt='atm pay' className="h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Dòng bản quyền */}
        <div className="text-center text-xs bg-gray-100 text-black py-3">
          © Bản quyền thuộc về <strong>Duy Nguyen</strong>
        </div>

        {/* Nút nổi bên phải */}
        {/* <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-3 z-50">
          <button className="bg-black text-white p-2 rounded-full shadow hover:scale-110 transition">
            <ArrowUpOutlined />
          </button>
          <button className="bg-red-600 text-white p-3 rounded-full shadow hover:scale-110 transition">
            <PhoneFilled />
          </button>
          <button className="bg-blue-500 text-white p-3 rounded-full shadow hover:scale-110 transition">
            <i className="fab fa-facebook-messenger text-lg" />
          </button>
        </div> */}
      </footer>
    </div>
  );
};

export default UserLayout;