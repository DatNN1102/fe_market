import { Button, Checkbox, Col, Input, Pagination, Radio, Row, Slider } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { CheckCircleOutlined, GiftOutlined, PhoneOutlined, SearchOutlined, ShoppingOutlined } from '@ant-design/icons';
import ProductCard from '../../component/ProductCard';
import { getProductApi } from '../../api/products';
import { getProductFeatureApi } from '../../api/product_features';

const Home: React.FC = () => {
    const [dataProduct, setDataProduct] = useState<any[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [search, setSearch] = useState<string>('');
    const [sort, setSort] = useState<string>('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000000]);
    const [sensor, setSensor] = useState<string[]>([]);
    const [features, setFeatures] = useState<Record<string, string[]>>({});
    const [featureList, setFeatureList] = useState<any[]>([]);

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
    const productListRef = useRef<HTMLDivElement>(null);

    const handleApply = async () => {
        callApiGetProduct(page, limit, search, sort, priceRange[0], priceRange[1], sensor, features);
    };

    const handleReset = () => {
        setPriceRange([0, 20000000]);
        setSensor([]);
        setFeatures({});
        setSearch('');
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
                    ? sensorValve.join(',') // ✅ Gửi dạng "0,1"
                    : sensorValve || '',
                feature: JSON.stringify(feature) // ✅ Gửi dạng JSON string
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
    }, [page, limit, sort]);

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
    }, []);

    return (
        <div className='over'>
            <div className="relative bg-gray-900 text-white">
                {/* Hình ảnh nền */}
                <img
                    src="/public/banner.png"
                    alt="Main Banner"
                    className="w-full object-contain"
                />

                {/* Nội dung chữ nằm trên hình */}
                {/* <div className="absolute inset-0 flex flex-col justify-center items-start px-10 md:px-20">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                        Chào mừng đến với DCAR
                    </h1>
                    <p className="text-base md:text-lg mb-6 max-w-xl drop-shadow">
                        Khám phá các sản phẩm áp suất lốp mới nhất với giá ưu đãi và hỗ trợ tốt nhất từ chúng tôi.
                    </p>
                </div> */}
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
                    <Row gutter={[16, 16]} className="w-full">
                        <Col span={6}>
                            <div className={`p-4 border border-[#ddd] rounded-[10px] shadow-sm bg-white space-y-6`}>
                                <div>
                                    <Input size="large" placeholder="Tìm sản phẩm" prefix={<SearchOutlined />}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
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

                                {featureList.map((feature) => (
                                    <div key={feature._id}>
                                        <div className="flex justify-between items-center font-semibold">
                                            <span>{feature.nameFeature}</span>
                                        </div>
                                        <Radio.Group
                                            value={features[feature.nameFeature] ?? ''} // ✅ Giá trị hiện tại (1 value duy nhất)
                                            onChange={(e) =>
                                                handleFeatureChange(feature.nameFeature, e.target.value) // ✅ Lấy value duy nhất
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


                                {/* {featureList.map((feature) => (
                                    <div key={feature._id}>
                                        <div className="flex justify-between items-center font-semibold">
                                            <span>{feature.nameFeature}</span>
                                        </div>
                                        <Checkbox.Group
                                            value={features[feature.nameFeature] as any ?? []}
                                            onChange={(checked) =>
                                                handleFeatureChange(feature.nameFeature, checked as string[])
                                            }
                                            className="flex flex-col mt-2 space-y-2"
                                        >
                                            {feature.valueFeature
                                                .split(',')
                                                .map((val: string) => val.trim())
                                                .filter((v: any) => v)
                                                .map((val: string, idx: number) => (
                                                    <Checkbox value={val} key={idx}>{val}</Checkbox>
                                                ))}
                                        </Checkbox.Group>
                                    </div>
                                ))} */}

                                {/* Nút áp dụng và xóa */}
                                <div className="flex justify-between">
                                    <Button type="default" className="bg-gray-100" onClick={handleApply}>
                                        Áp dụng
                                    </Button>
                                    <button onClick={handleReset} className="text-orange-600 font-medium">
                                        Xóa bộ lọc
                                    </button>
                                </div>
                            </div>
                        </Col>
                        <Col span={18}>
                            <Row gutter={[16, 16]} className="w-full">
                                {dataProduct.map((item, index) => (
                                    <Col span={8} key={index}>
                                        <ProductCard key={index} {...item} />
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                    </Row>

                    {/* Navigator bên dưới */}
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
