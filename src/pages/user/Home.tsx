import { Button, Col, Input, Pagination, Radio, Row, Slider, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import {
    CheckCircleOutlined, GiftOutlined, PhoneOutlined,
    SearchOutlined, ShoppingOutlined, ThunderboltOutlined,
    SortAscendingOutlined, SortDescendingOutlined // Import thêm icon cho đẹp
} from '@ant-design/icons';
import ProductCard from '../../component/ProductCard';
import { getProductApi, getBestDealApi } from '../../api/products';
import { getProductFeatureApi } from '../../api/product_features';

const Home: React.FC = () => {
    const [dataProduct, setDataProduct] = useState<any[]>([]);
    const [bestDeals, setBestDeals] = useState<any[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const [search, setSearch] = useState<string>('');

    // ✅ BƯỚC 1: Thêm setSort vào useState
    const [sort, setSort] = useState<string>('');

    const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000000]);
    const [sensor, setSensor] = useState<string[]>([]);
    const [features, setFeatures] = useState<Record<string, string[]>>({});
    const [featureList, setFeatureList] = useState<any[]>([]);
    const productListRef = useRef<HTMLDivElement>(null);

    const featuresHome = [
        {
            icon: <ShoppingOutlined className="text-3xl" />,
            title: 'Vận chuyển miễn phí',
            desc: 'Hóa đơn trên 5 triệu',
            bg: 'bg-blue-50',
        },
        {
            icon: <GiftOutlined className="text-3xl" />,
            title: 'Quà tặng hấp dẫn',
            desc: 'Hóa đơn trên 10 triệu',
            bg: 'bg-rose-50',
        },
        {
            icon: <CheckCircleOutlined className="text-3xl" />,
            title: 'Chứng nhận chất lượng',
            desc: 'Sản phẩm chính hãng',
            bg: 'bg-yellow-50',
        },
        {
            icon: <PhoneOutlined className="text-3xl" />,
            title: 'Hotline: 1900 6750',
            desc: 'Hỗ trợ 24/7',
            bg: 'bg-green-50',
        },
    ];

    const fetchBestDeals = async () => {
        try {
            const res = await getBestDealApi(4);
            if (res.success) {
                setBestDeals(res.data);
            }
        } catch (error) {
            console.error("Lỗi lấy best deals:", error);
        }
    };

    const handleApply = async () => {
        callApiGetProduct(page, limit, search, sort, priceRange[0], priceRange[1], sensor, features);
    };

    // ✅ BƯỚC 3: Reset cả sort về mặc định
    const handleReset = () => {
        setPriceRange([0, 20000000]);
        setSensor([]);
        setFeatures({});
        setSearch('');
        setSort(''); // Reset sort
    };

    const callApiGetProduct = async (
        pageProduct: number,
        limitProduct: number,
        searchText = '',
        sortValue = '',
        minPrice: any,
        maxPrice: any,
        sensorValve: string[] = ['0', '1'],
        feature: Record<string, string[]> = {}
    ) => {
        try {
            const result = await getProductApi({
                page: pageProduct,
                limit: limitProduct,
                search: searchText,
                sort: sortValue,
                minPrice: minPrice,
                maxPrice: maxPrice,
                sensorValve: Array.isArray(sensorValve)
                    ? sensorValve.join(',')
                    : sensorValve || '',
                feature: JSON.stringify(feature)
            });
            setDataProduct(result.data);
            setTotal(result.total);
        } catch (error) {
            console.error('Lỗi tải dữ liệu:', error);
        }
    };

    const handleFeatureChange = (featureName: string, checkedValues: string[]) => {
        setFeatures((prev) => ({
            ...prev,
            [featureName]: checkedValues
        }));
    };

    useEffect(() => {
        callApiGetProduct(page, limit, search, sort, priceRange[0], priceRange[1], sensor, features);
    }, [page, limit, sort]); // sort thay đổi sẽ tự gọi lại API

    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const res = await getProductFeatureApi({ isShow: 1 });
                setFeatureList(res.data);
            } catch (err) {
                console.error('Lỗi lấy danh sách tính năng:', err);
            }
        };
        fetchFeatures();
        fetchBestDeals();
    }, []);

    return (
        <div className='over'>
            <div className="relative bg-gray-900 text-white">
                <img
                    src="/banner.png"
                    alt="Main Banner"
                    className="w-full object-contain"
                />
            </div>
            <div className='ctnCustom'>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-6 px-4 md:px-10 w-full">
                    {featuresHome.map((feature, index) => (
                        <div
                            key={index}
                            className={`${feature.bg} flex items-center gap-4 p-4 rounded-xl shadow-sm`}
                        >
                            <div className="text-black">{feature.icon}</div>
                            <div>
                                <h4 className="font-semibold text-base">{feature.title}</h4>
                                <p className="text-sm text-gray-600">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="ctnCustom">
                <div className="flex flex-col items-center w-full" ref={productListRef}>

                    {bestDeals.length > 0 && (
                        <div className="w-full mb-8 bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-2xl border border-red-100">
                            <div className="flex items-center gap-2 mb-4 border-b border-red-200 pb-2">
                                <ThunderboltOutlined className="text-2xl text-red-600 animate-pulse" />
                                <h2 className="text-2xl font-bold text-red-600 uppercase m-0">
                                    Săn Sale Giá Sốc
                                </h2>
                                <Tag color="red" className="ml-2 font-bold">HOT</Tag>
                            </div>
                            <Row gutter={[16, 16]}>
                                {bestDeals.map((item, index) => (
                                    <Col span={6} key={index}>
                                        <div className="relative transform hover:-translate-y-1 transition duration-300">
                                            <div className="absolute top-2 right-2 z-10 bg-red-600 text-white px-2 py-1 rounded-md font-bold text-xs shadow-md">
                                                -{item.discountPercent ? Math.round(item.discountPercent) : 0}%
                                            </div>
                                            <ProductCard {...item} />
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}

                    <Row gutter={[16, 16]} className="w-full">
                        <Col span={6}>
                            <div className={`p-4 border border-[#ddd] rounded-[10px] shadow-sm bg-white space-y-6`}>
                                <div>
                                    <Input size="large" placeholder="Tìm sản phẩm" prefix={<SearchOutlined />}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                {/* Khoảng giá */}
                                <div>
                                    <div className="flex justify-between items-center font-semibold">
                                        <span>Khoảng giá</span>
                                    </div>
                                    <Slider
                                        range
                                        step={100000}
                                        min={0}
                                        max={20000000}
                                        value={priceRange}
                                        onChange={(value) => setPriceRange(value as [number, number])}
                                    />
                                    <div className="text-sm text-gray-600 font-medium">
                                        {priceRange[0].toLocaleString()}đ - {priceRange[1].toLocaleString()}đ
                                    </div>
                                </div>

                                {/* ✅ BƯỚC 2: Thêm UI Sắp xếp giá */}
                                <div className="border-t border-gray-100 pt-4">
                                    <div className="flex justify-between items-center font-semibold mb-2">
                                        <span>Sắp xếp theo giá</span>
                                    </div>
                                    <Radio.Group
                                        value={sort}
                                        onChange={(e) => setSort(e.target.value)}
                                        className="flex flex-col space-y-2"
                                    >
                                        <Radio value="">Mặc định</Radio>
                                        <Radio value="asc">
                                            <span className="flex items-center gap-2">
                                                <SortAscendingOutlined /> Giá tăng dần
                                            </span>
                                        </Radio>
                                        <Radio value="desc">
                                            <span className="flex items-center gap-2">
                                                <SortDescendingOutlined /> Giá giảm dần
                                            </span>
                                        </Radio>
                                    </Radio.Group>
                                </div>
                                {/* ----------------------------- */}

                                {featureList.map((feature) => (
                                    <div key={feature._id} className="border-t border-gray-100 pt-4">
                                        <div className="flex justify-between items-center font-semibold">
                                            <span>{feature.nameFeature}</span>
                                        </div>
                                        <Radio.Group
                                            value={features[feature.nameFeature] ?? ''}
                                            onChange={(e) =>
                                                handleFeatureChange(feature.nameFeature, e.target.value)
                                            }
                                            className="flex flex-col mt-2 space-y-2"
                                        >
                                            {feature.valueFeature
                                                .split(',')
                                                .map((val: string) => val.trim())
                                                .filter((v: any) => v)
                                                .map((val: string, idx: number) => (
                                                    <Radio value={val} key={idx}>
                                                        {val}
                                                    </Radio>
                                                ))}
                                        </Radio.Group>
                                    </div>
                                ))}

                                <div className="flex justify-between pt-2">
                                    <Button type="default" className="bg-gray-100" onClick={handleApply}>
                                        Áp dụng
                                    </Button>
                                    <button onClick={handleReset} className="text-orange-600 font-medium hover:underline">
                                        Xóa bộ lọc
                                    </button>
                                </div>
                            </div>
                        </Col>

                        <Col span={18}>
                            <div className="flex items-center gap-2 mb-4">
                                <ShoppingOutlined className="text-xl text-blue-600" />
                                <h3 className="text-xl font-bold text-gray-800 m-0">Tất cả sản phẩm</h3>
                            </div>
                            <Row gutter={[16, 16]} className="w-full">
                                {dataProduct.map((item, index) => (
                                    <Col span={8} key={index}>
                                        <ProductCard key={index} {...item} />
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                    </Row>

                    <div className="flex justify-center py-4">
                        <Pagination
                            current={page}
                            pageSize={limit}
                            total={total}
                            onChange={(page) => { setPage(page), productListRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                            showSizeChanger={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Home;