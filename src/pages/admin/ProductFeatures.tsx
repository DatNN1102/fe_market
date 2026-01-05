import React, { useEffect, useState } from 'react';
import {
    Input,
    Table,
    Tag,
    Modal,
    message,
    Button,
    Form,
} from 'antd';
import {
    getProductFeatureApi,
    updateProductFeatureApi,
    addProductFeatureApi
} from '../../api/product_features';
import moment from 'moment';

const { Search } = Input;

const ProductFeatures: React.FC = () => {
    const [valueChoise, setValueChoise] = useState<string>('');
    const [valueChoiseOne, setValueChoiseOne] = useState<string>('');
    const [features, setFeatures] = useState<any[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [editingFeature, setEditingFeature] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isShow] = useState<number | undefined>(undefined);
    const [form] = Form.useForm();

    const fetchData = async () => {
        try {
            const result = await getProductFeatureApi({
                page,
                limit,
                isShow
            });
            setFeatures(result.data);
            setTotal(result.total);
        } catch (error) {
            console.error('Lỗi tải tính năng sản phẩm:', error);
        }
    };

    const handleAddValue = (newValue: string) => {
        if (newValue) {
            const current = form.getFieldValue('valueFeature') || '';
            const values = current.split(',').filter((v: string) => v.trim() !== '');
            if (!values.includes(newValue)) {
                values.push(newValue);
                form.setFieldsValue({
                    valueFeature: values.join(',')
                });
                setValueChoise(values.join(','))
                setValueChoiseOne('')
            } else {
                message.warning('Giá trị đã tồn tại!');
            }
        }
    };

    const handleRemoveValue = (removeValue: string) => {
        const current = form.getFieldValue('valueFeature') || '';
        const values = current.split(',').filter((v: string) => v.trim() !== '' && v !== removeValue);
        form.setFieldsValue({
            valueFeature: values.join(',')
        });
        setValueChoise(values.join(','))
        setValueChoiseOne('')
    };

    useEffect(() => {
        fetchData();
    }, [page, limit, isShow]);

    const handleAddFeature = () => {
        setEditingFeature(null);
        form.resetFields();
        setValueChoise('')
        setValueChoiseOne('')
        setIsModalOpen(true);
    };

    const handleEditFeature = (record: any) => {
        setEditingFeature(record);
        form.setFieldsValue({
            nameFeature: record.nameFeature,
            valueFeature: record.valueFeature,
            isShow: record.isShow,
        });
        setValueChoise(record.valueFeature)
        setValueChoiseOne('')
        setIsModalOpen(true);
    };

    const handleSaveFeature = async () => {
        try {
            var values = await form.validateFields();
            values = {
                ...values,
                valueFeature: valueChoise,
            }

            if (editingFeature) {
                // Update
                await updateProductFeatureApi(editingFeature._id, values);
                message.success('Cập nhật tính năng thành công!');
            } else {
                // Add
                await addProductFeatureApi(values);
                message.success('Thêm tính năng thành công!');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
            message.error('Lỗi khi lưu tính năng');
        }
    };

    const columns = [
        {
            title: 'Tên tính năng',
            dataIndex: 'nameFeature',
            key: 'nameFeature',
        },
        {
            title: 'Giá trị',
            dataIndex: 'valueFeature',
            key: 'valueFeature',
            render: (text: string) => (
                <div className="flex flex-wrap gap-1">
                    {text
                        .split(',')
                        .map((v) => v.trim())
                        .filter((v) => v)
                        .map((item, index) => (
                            <Tag key={index} color="blue">
                                {item}
                            </Tag>
                        ))}
                </div>
            ),
        },
        // {
        //     title: 'Hiển thị',
        //     dataIndex: 'isShow',
        //     key: 'isShow',
        //     render: (value: number, record: any) => (
        //         <Dropdown
        //             trigger={['click']}
        //             menu={{
        //                 onClick: ({ key }) => {
        //                     const newValue = key === 'true';
        //                     if ((newValue && value === 1) || (!newValue && value === 0)) return;
        //                     handleUpdateIsShow(record, newValue);
        //                 },
        //                 items: [
        //                     {
        //                         key: 'true',
        //                         label: 'Hiện',
        //                         disabled: value === 1,
        //                     },
        //                     {
        //                         key: 'false',
        //                         label: 'Ẩn',
        //                         disabled: value === 0,
        //                     },
        //                 ],
        //             }}
        //         >
        //             <Tag color={value ? 'green' : 'red'} className="cursor-pointer">
        //                 {value ? 'Hiện' : 'Ẩn'}
        //             </Tag>
        //         </Dropdown>
        //     ),
        // },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: any) => (
                <Button type="primary" onClick={() => handleEditFeature(record)}>
                    Sửa
                </Button>
            ),
        },
    ];

    return (
        <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-4 gap-2">
                <h1 className="text-2xl font-bold">Danh sách tính năng sản phẩm</h1>
                <div className="flex gap-2">
                    {/* <Select
                        placeholder="Lọc hiển thị"
                        allowClear
                        style={{ width: 150 }}
                        value={isShow}
                        onChange={(value) => {
                            setIsShow(value);
                            setPage(1);
                        }}
                    >
                        <Option value={undefined}>Tất cả</Option>
                        <Option value={1}>Hiện</Option>
                        <Option value={0}>Ẩn</Option>
                    </Select> */}
                    <Button type="primary" onClick={handleAddFeature}>
                        Thêm tính năng
                    </Button>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={features}
                pagination={{
                    current: page,
                    pageSize: limit,
                    total,
                    onChange: (newPage, newSize) => {
                        setPage(newPage);
                        setLimit(newSize);
                    },
                }}
                rowKey="_id"
            />

            {/* Modal Add/Edit */}
            <Modal
                open={isModalOpen}
                title={editingFeature ? 'Sửa tính năng' : 'Thêm tính năng mới'}
                onOk={handleSaveFeature}
                onCancel={() => setIsModalOpen(false)}
                okText={editingFeature ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ isShow: 1 }}
                >
                    <Form.Item
                        label="Tên tính năng"
                        name="nameFeature"
                        rules={[{ required: true, message: 'Vui lòng nhập tên tính năng' }]}
                    >
                        <Input placeholder="Nhập tên tính năng" />
                    </Form.Item>
                    <Form.Item label="Giá trị">
                        <div className="flex flex-col gap-2">
                            {/* Hiển thị danh sách giá trị đã thêm */}
                            <div className="flex flex-wrap gap-1">
                                {(valueChoise || '')
                                    .split(',')
                                    .filter((v: string) => v.trim() !== '')
                                    .map((item: string, index: number) => (
                                        <Tag
                                            key={index}
                                            color="blue"
                                            closable
                                            onClose={() => handleRemoveValue(item)}
                                        >
                                            {item}
                                        </Tag>
                                    ))}
                            </div>

                            {/* Ô nhập và nút Thêm */}
                            <Search
                                value={valueChoiseOne}
                                placeholder="Thêm giá trị"
                                allowClear
                                enterButton="Thêm"
                                size="large"
                                onChange={(e) => setValueChoiseOne(e.target.value)}
                                onSearch={handleAddValue}
                            />
                        </div>
                    </Form.Item>
                    {/* <Form.Item
                        label="Hiển thị"
                        name="isShow"
                        rules={[{ required: true }]}
                    >
                        <Select placeholder="Chọn trạng thái">
                            <Option value={1}>Hiện</Option>
                            <Option value={0}>Ẩn</Option>
                        </Select>
                    </Form.Item> */}
                </Form>
            </Modal>
        </div>
    );
};

export default ProductFeatures;
