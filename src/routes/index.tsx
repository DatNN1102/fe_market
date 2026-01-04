import React from 'react';
import { Routes, Route } from 'react-router-dom';

import UserLayout from '../layouts/UserLayout';
import Home from '../pages/user/Home';
import Detail from '../pages/user/Detail';
import DetailPay from '../pages/user/DetailPay';
import Giohang from '../pages/user/Giohang';
import HistoryOder from '../pages/user/HistoryOder';
import OrderSuccess from '../pages/user/OrderSuccess';
import Profile from '../pages/user/Profile';

import Login from '../pages/Login';
import Signup from '../pages/Signup';

import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import Users from '../pages/admin/Users';
import Products from '../pages/admin/Products';
import Orders from '../pages/admin/Orders';
import Evaluate from '../pages/admin/Evaluate';
import Warranty from '../pages/admin/Warranty';
import ProductFeatures from '../pages/admin/ProductFeatures';

import RequireAuth from '../component/RequireAuth';

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<UserLayout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />
                <Route path="detail/:id" element={<Detail />} />
                <Route element={<RequireAuth allowedRoles={['user']} />}>
                    <Route path="order-success/:id" element={<OrderSuccess />} />
                    <Route path="giohang" element={<Giohang />} />
                    <Route path="detailpay" element={<DetailPay />} />
                    <Route path="history-order" element={<HistoryOder />} />
                    <Route path="profile" element={<Profile />} />
                </Route>
            </Route>
            <Route element={<RequireAuth allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="users" element={<Users />} />
                    <Route path="products" element={<Products />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="evaluate" element={<Evaluate />} />
                    <Route path="warranty" element={<Warranty />} />
                    <Route path="product-features" element={<ProductFeatures />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRoutes;
