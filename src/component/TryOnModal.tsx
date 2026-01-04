import React, { useState, useEffect } from 'react';
import { Modal, Button, Upload, Input, Form, Spin, message, Image, Divider, Row, Col } from 'antd';
import { UploadOutlined, ExperimentOutlined, DownloadOutlined, SkinOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import axios from 'axios';

interface TryOnModalProps {
    visible: boolean;
    onClose: () => void;
    productImage?: string;
    productType?: 'shirt' | 'pant';
}

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/openai`;

const TryOnModal: React.FC<TryOnModalProps> = ({ visible, onClose, productImage, productType }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);

    // State cho 3 loại file riêng biệt theo BE
    const [bodyFile, setBodyFile] = useState<File | null>(null);
    const [pantFile, setPantFile] = useState<File | null>(null);
    const [shirtFile, setShirtFile] = useState<File | null>(null);

    // List hiển thị Antd
    const [bodyList, setBodyList] = useState<UploadFile[]>([]);
    const [pantList, setPantList] = useState<UploadFile[]>([]);
    const [shirtList, setShirtList] = useState<UploadFile[]>([]);

    useEffect(() => {
        if (productImage && visible) {
            // Tự động gán ảnh sản phẩm vào đúng ô (Quần hoặc Áo)
            const mockFile: UploadFile = {
                uid: '-1',
                name: 'product.png',
                status: 'done',
                url: productImage
            };

            if (productType === 'pant') {
                setPantList([mockFile]);
                setShirtList([]);
            } else {
                setShirtList([mockFile]);
                setPantList([]);
            }

            form.setFieldValue('prompt', `Thực hiện virtual try-on chuyên nghiệp.`);
        }
    }, [productImage, visible, productType, form]);

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

    const onFinish = async (values: any) => {
        // Kiểm tra đủ 3 thành phần như BE yêu cầu
        if (!bodyFile && bodyList.length === 0) return message.warning('Thiếu ảnh người mẫu!');
        if (!pantList.length) return message.warning('Thiếu ảnh quần!');
        if (!shirtList.length) return message.warning('Thiếu ảnh áo!');

        setLoading(true);
        setResultImageUrl(null);

        try {
            const formData = new FormData();

            // 1. Ảnh người mẫu
            if (bodyFile) formData.append('bodyImage', bodyFile);

            // 2. Ảnh Quần (Nếu là file thì gửi file, nếu là URL thì gửi string)
            if (pantFile) {
                formData.append('pantImage', pantFile);
            } else if (pantList[0]?.url) {
                formData.append('pantImage', pantList[0].url);
            }

            // 3. Ảnh Áo
            if (shirtFile) {
                formData.append('shirtImage', shirtFile);
            } else if (shirtList[0]?.url) {
                formData.append('shirtImage', shirtList[0].url);
            }

            const response = await axios.post(`${API_BASE_URL}/generate`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                // Lấy object data từ phản hồi
                const aiData = response.data.data;

                // Kiểm tra xem backend có trả về mảng imageUrl và có dữ liệu bên trong không
                if (aiData && Array.isArray(aiData.imageUrl) && aiData.imageUrl.length > 0) {
                    const rawBase64 = aiData.imageUrl[0];
                    const fullBase64Url = rawBase64.startsWith('data:')
                        ? rawBase64
                        : `data:image/png;base64,${rawBase64}`;
                    setResultImageUrl(fullBase64Url);
                    message.success('AI đã hoàn thành bản thử đồ! ✨');
                } else {
                    message.warning('AI đã xử lý xong nhưng không tìm thấy ảnh trả về.');
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
            title={<span><SkinOutlined /> PHÒNG THỬ ĐỒ AI</span>}
            open={visible}
            onCancel={onClose}
            width={1000}
            footer={[
                <Button key="close" onClick={onClose}>Đóng</Button>,
                <Button key="run" type="primary" icon={<ExperimentOutlined />} loading={loading} onClick={() => form.submit()}>
                    Bắt đầu thử đồ
                </Button>
            ]}
        >
            <Spin spinning={loading} tip="GPT-4o đang thiết kế bộ đồ cho anh...">
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="1. Người mẫu" required>
                                <Upload {...getUploadProps(setBodyFile, setBodyList)} fileList={bodyList}>
                                    <Button icon={<UploadOutlined />} block>Ảnh của anh</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="2. Quần (Pants)" required>
                                <Upload {...getUploadProps(setPantFile, setPantList)} fileList={pantList}>
                                    <Button icon={<UploadOutlined />} block>Ảnh quần</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="3. Áo (Shirt)" required>
                                <Upload {...getUploadProps(setShirtFile, setShirtList)} fileList={shirtList}>
                                    <Button icon={<UploadOutlined />} block>Ảnh áo</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>

                    {resultImageUrl && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                            <Divider>KẾT QUẢ THỬ ĐỒ</Divider>
                            <Image src={resultImageUrl} width={400} className="rounded shadow-lg" />
                            <div className="mt-4">
                                <Button
                                    icon={<DownloadOutlined />}
                                    type="primary"
                                    onClick={() => window.open(resultImageUrl, '_blank')}
                                >
                                    Tải ảnh kết quả
                                </Button>
                            </div>
                        </div>
                    )}
                </Form>
            </Spin>
        </Modal>
    );
};

export default TryOnModal;