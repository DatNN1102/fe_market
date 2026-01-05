import React, { useState, useEffect } from 'react';
import {
    Modal, Button, Upload, Form, Spin, message, Image,
    Divider, Row, Col, Card, List, Tag, Empty
} from 'antd';
import {
    UploadOutlined, ExperimentOutlined,
    SkinOutlined, PlusCircleOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import axios from 'axios';

interface TryOnModalProps {
    visible: boolean;
    onClose: () => void;
    productId?: string; // Thêm ID để gọi API gợi ý
    productImage?: string;
    productType?: 'shirt' | 'pant';
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Base URL chung
const IMG_URL_PREFIX = import.meta.env.VITE_API_IMG_URL; // URL chứa ảnh

const TryOnModal: React.FC<TryOnModalProps> = ({
    visible, onClose, productImage, productType, productId
}) => {
    const [form] = Form.useForm();

    // State xử lý Try-on
    const [loading, setLoading] = useState(false);
    const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);

    // State file upload
    const [bodyFile, setBodyFile] = useState<File | null>(null);
    const [pantFile, setPantFile] = useState<File | null>(null);
    const [shirtFile, setShirtFile] = useState<File | null>(null);

    const [bodyList, setBodyList] = useState<UploadFile[]>([]);
    const [pantList, setPantList] = useState<UploadFile[]>([]);
    const [shirtList, setShirtList] = useState<UploadFile[]>([]);

    // State gợi ý sản phẩm
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loadingRecs, setLoadingRecs] = useState(false);

    // 1. Setup mặc định khi mở Modal
    useEffect(() => {
        if (visible) {
            // Reset kết quả cũ
            setResultImageUrl(null);

            // Setup ảnh sản phẩm chính vào đúng ô
            if (productImage) {
                const mockFile: UploadFile = {
                    uid: '-1',
                    name: 'current_product.png',
                    status: 'done',
                    url: productImage.startsWith('http') ? productImage : `${IMG_URL_PREFIX}/${productImage}`
                };

                if (productType === 'pant') {
                    setPantList([mockFile]);
                    setShirtList([]); // Clear ô kia
                    setPantFile(null); // Clear file gốc nếu có
                } else {
                    setShirtList([mockFile]);
                    setPantList([]);
                    setShirtFile(null);
                }
            }

            // Gọi API lấy gợi ý nếu có productId
            if (productId) {
                fetchRecommendations(productId);
            }
        }
    }, [productImage, visible, productType, productId]);

    // 2. Hàm gọi API gợi ý
    const fetchRecommendations = async (id: string) => {
        setLoadingRecs(true);
        try {
            // Giả sử API route là: /products/recommend/:id
            // Anh sửa lại đường dẫn đúng với route anh đã khai báo nhé
            const res = await axios.get(`${API_BASE_URL}/products/recommend/${id}`);
            if (res.data.success) {
                setRecommendations(res.data.data);
            }
        } catch (error) {
            console.error("Lỗi lấy gợi ý:", error);
        } finally {
            setLoadingRecs(false);
        }
    };

    // 3. Hàm xử lý khi chọn đồ gợi ý
    const handleSelectRecommendation = (item: any) => {
        const imgUrl = item.images.startsWith('http')
            ? item.images
            : `${IMG_URL_PREFIX}/${item.images}`;

        const mockFile: UploadFile = {
            uid: item._id || Date.now().toString(),
            name: item.name,
            status: 'done',
            url: imgUrl
        };

        // Kiểm tra xem ô Áo có trống không?
        const isShirtEmpty = shirtList.length === 0;

        // Kiểm tra xem ô Quần có trống không?
        const isPantEmpty = pantList.length === 0;

        // Logic ưu tiên: Điền vào ô đang trống
        if (isShirtEmpty) {
            // Nếu ô áo trống -> Điền vào áo
            setShirtList([mockFile]);
            setShirtFile(null);
            message.success(`Đã chọn áo: ${item.name}`);
        } else if (isPantEmpty) {
            // Nếu ô quần trống -> Điền vào quần
            setPantList([mockFile]);
            setPantFile(null);
            message.success(`Đã chọn quần: ${item.name}`);
        } else {
            // Trường hợp cả 2 đều ĐÃ CÓ ẢNH (full)
            // Thì mình thay thế cái nào KHÔNG PHẢI là sản phẩm chính (productType)
            if (productType === 'shirt') {
                // Sản phẩm chính là Áo, thì thay thế Quần
                setPantList([mockFile]);
                setPantFile(null);
                message.success(`Đã thay đổi quần: ${item.name}`);
            } else {
                // Sản phẩm chính là Quần, thì thay thế Áo
                setShirtList([mockFile]);
                setShirtFile(null);
                message.success(`Đã thay đổi áo: ${item.name}`);
            }
        }
    };

    const getUploadProps = (setFile: any, setList: any): UploadProps => ({
        maxCount: 1,
        listType: 'picture',
        beforeUpload: (file) => {
            setFile(file);
            setList([{ uid: file.uid, name: file.name, status: 'done', url: URL.createObjectURL(file) }]);
            return false;
        },
        onRemove: () => { setFile(null); setList([]); }
    });

    const onFinish = async () => {
        if (!bodyFile && bodyList.length === 0) return message.warning('Thiếu ảnh người mẫu!');
        if (!pantList.length) return message.warning('Thiếu ảnh quần!');
        if (!shirtList.length) return message.warning('Thiếu ảnh áo!');

        setLoading(true);
        setResultImageUrl(null);

        try {
            const formData = new FormData();
            if (bodyFile) formData.append('bodyImage', bodyFile);

            // Logic: Ưu tiên File upload, nếu không có thì lấy URL (trường hợp chọn từ gợi ý)
            if (pantFile) {
                formData.append('pantImage', pantFile);
            } else if (pantList[0]?.url) {
                formData.append('pantImage', pantList[0].url);
            }

            if (shirtFile) {
                formData.append('shirtImage', shirtFile);
            } else if (shirtList[0]?.url) {
                formData.append('shirtImage', shirtList[0].url);
            }

            const response = await axios.post(`${API_BASE_URL}/openai/generate`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                const aiData = response.data.data;
                if (aiData && Array.isArray(aiData.imageUrl) && aiData.imageUrl.length > 0) {
                    const rawBase64 = aiData.imageUrl[0];
                    const fullBase64Url = rawBase64.startsWith('data:')
                        ? rawBase64
                        : `data:image/png;base64,${rawBase64}`;
                    setResultImageUrl(fullBase64Url);
                    message.success('Phối đồ hoàn tất! ✨');
                } else {
                    message.warning('Không nhận được ảnh kết quả.');
                }
            }
        } catch (err: any) {
            message.error('Lỗi: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={<span><SkinOutlined /> PHÒNG THỬ ĐỒ AI & GỢI Ý PHỐI ĐỒ</span>}
            open={visible}
            onCancel={onClose}
            width={1100} // Mở rộng modal để chứa cột gợi ý
            footer={null}
            style={{ top: 20 }}
        >
            <Row gutter={24}>
                {/* CỘT TRÁI: FORM UPLOAD & KẾT QUẢ */}
                <Col xs={24} md={15}>
                    <Spin spinning={loading} tip="Stylist AI đang làm việc...">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <Form form={form} layout="vertical" onFinish={onFinish}>
                                <Row gutter={16}>
                                    <Col span={24}>
                                        <Form.Item label={<span className="font-semibold">1. Ảnh của bản thân (Full body)</span>} required>
                                            <Upload {...getUploadProps(setBodyFile, setBodyList)} fileList={bodyList}>
                                                <Button icon={<UploadOutlined />} block size="large">Tải ảnh lên</Button>
                                            </Upload>
                                        </Form.Item>
                                    </Col>

                                    <Col span={12}>
                                        <Form.Item label={<span className="font-semibold">2. Sản phẩm đang chọn</span>} required>
                                            <Upload {...getUploadProps(setShirtFile, setShirtList)} fileList={shirtList}>
                                                <Button icon={<UploadOutlined />} block>Tải ảnh sản phẩm</Button>
                                            </Upload>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={<span className="font-semibold">3. Sản phẩm đi kèm</span>} required>
                                            <Upload {...getUploadProps(setPantFile, setPantList)} fileList={pantList}>
                                                <Button icon={<UploadOutlined />} block>Tải ảnh sản phẩm khác</Button>
                                            </Upload>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    size="large"
                                    icon={<ExperimentOutlined />}
                                    loading={loading}
                                    className="mt-2 bg-gradient-to-r from-blue-500 to-purple-600 border-none h-12 text-lg"
                                >
                                    BẮT ĐẦU THỬ ĐỒ NGAY
                                </Button>
                            </Form>

                            {resultImageUrl && (
                                <div className="mt-6 text-center animate-fade-in">
                                    <Divider dashed style={{ borderColor: '#7cb305' }}>KẾT QUẢ THỬ ĐỒ</Divider>
                                    <Image src={resultImageUrl} className="rounded-lg shadow-2xl border-4 border-white" />
                                    {/* <div className="mt-4">
                                        <Button
                                            icon={<DownloadOutlined />}
                                            size="large"
                                            onClick={() => window.open(resultImageUrl, '_blank')}
                                        >
                                            Tải ảnh về máy
                                        </Button>
                                    </div> */}
                                </div>
                            )}
                        </div>
                    </Spin>
                </Col>

                {/* CỘT PHẢI: GỢI Ý SẢN PHẨM */}
                <Col xs={24} md={9}>
                    <div className="h-full border-l pl-4 border-gray-200">
                        <div className="flex items-center mb-4">
                            <SkinOutlined className="text-xl text-blue-600 mr-2" />
                            <h3 className="text-lg font-bold m-0">Gợi ý phối đồ</h3>
                        </div>

                        <p className="text-gray-500 text-sm mb-4">
                            Các sản phẩm dưới đây hợp gu với món đồ anh đang chọn. Bấm <b>"Thử ngay"</b> để đưa vào phòng thử.
                        </p>

                        <Spin spinning={loadingRecs}>
                            {recommendations.length > 0 ? (
                                <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                                    <List
                                        grid={{ gutter: 16, column: 1 }}
                                        dataSource={recommendations}
                                        renderItem={(item) => (
                                            <List.Item>
                                                <Card
                                                    hoverable
                                                    size="small"
                                                    bodyStyle={{ padding: '8px' }}
                                                    className="shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex gap-3">
                                                        <Image
                                                            src={item.images.startsWith('http') ? item.images : `${IMG_URL_PREFIX}/${item.images}`}
                                                            width={80}
                                                            height={80}
                                                            className="object-cover rounded"
                                                            preview={false}
                                                        />
                                                        <div className="flex-1 flex flex-col justify-between">
                                                            <div>
                                                                <h4 className="font-semibold text-sm line-clamp-1" title={item.name}>{item.name}</h4>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {/* Hiển thị giá hoặc tính năng nếu cần */}
                                                                    <Tag color="cyan">Phù hợp</Tag>
                                                                    <span className="text-red-500 font-bold">
                                                                        {item.promotionalPrice?.toLocaleString()}đ
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                type="dashed"
                                                                size="small"
                                                                icon={<PlusCircleOutlined />}
                                                                className="text-blue-600 border-blue-600 mt-2"
                                                                onClick={() => handleSelectRecommendation(item)}
                                                            >
                                                                Thử ngay
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </List.Item>
                                        )}
                                    />
                                </div>
                            ) : (
                                <Empty description="Chưa có gợi ý phù hợp" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                        </Spin>
                    </div>
                </Col>
            </Row>
        </Modal>
    );
};

export default TryOnModal;