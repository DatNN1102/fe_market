import React, { useEffect, useState } from 'react';
import {
    Input,
    Table,
    Tag,
    Modal,
    Descriptions,
    Dropdown,
    message,
    Select,
    Button,
} from 'antd';
import { getEvaluateApi, updateEvaluateApi } from '../../api/evaluate';
import moment from 'moment';

const { Option } = Select;

const EvaluateList: React.FC = () => {
    const [evaluates, setEvaluates] = useState<any[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [selectedEvaluate, setSelectedEvaluate] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchName, setSearchName] = useState('');
    const [starRating, setStarRating] = useState<number | undefined>(undefined);

    const fetchData = async () => {
        try {
            const result = await getEvaluateApi({
                page,
                limit,
                fullName: searchName,
                starRating,
            });
            setEvaluates(result.data);
            setTotal(result.total);
        } catch (error) {
            console.error('Lỗi tải đánh giá:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, limit, searchName, starRating]);

    const handleView = (record: any) => {
        setSelectedEvaluate(record);
        setIsModalOpen(true);
    };

    const handleUpdateIsShow = async (record: any, newValue: boolean) => {
        try {
            await updateEvaluateApi(record._id, { isShow: newValue });
            message.success('Cập nhật hiển thị thành công!');
            fetchData(); // reload danh sách
        } catch (error) {
            message.error('Lỗi khi cập nhật hiển thị');
        }
    };

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: ['productID', 'name'],
            key: 'productID',
        },
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Nội dung',
            dataIndex: 'contentEvaluate',
            key: 'contentEvaluate',
            render: (text: string) => <span>{text.slice(0, 50)}...</span>,
        },
        {
            title: 'Sao',
            dataIndex: 'starRating',
            key: 'starRating',
            render: (rating: number) => <span>{rating} ★</span>,
        },
        {
            title: 'Hiển thị',
            dataIndex: 'isShow',
            key: 'isShow',
            render: (value: any, record: any) => {
                return (
                    <Dropdown
                        trigger={['click']}
                        menu={{
                            onClick: ({ key }) => {
                                if ((key === 'true' && value === 1) || (key === 'false' && value === 0)) return;
                                handleUpdateIsShow(record, key === 'true');
                            },
                            items: [
                                {
                                    key: 'true',
                                    label: 'Hiện',
                                    disabled: value === 1,
                                },
                                {
                                    key: 'false',
                                    label: 'Ẩn',
                                    disabled: value === 0,
                                },
                            ],
                        }}
                    >
                        <Tag color={value ? 'green' : 'red'} className="cursor-pointer">
                            {value ? 'Hiện' : 'Ẩn'}
                        </Tag>
                    </Dropdown>
                );
            },
        },
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
                <Button type='primary' onClick={() => handleView(record)}>Xem</Button>
            ),
        },
    ];

    return (
        <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-4 gap-2">
                <h1 className="text-2xl font-bold">Danh sách đánh giá</h1>
                <div className="flex gap-2">
                    {/* <Input.Search
                        placeholder="Tìm theo tên"
                        allowClear
                        onSearch={(value) => {
                            setSearchName(value);
                            setPage(1);
                        }}
                        style={{ width: 220 }}
                    /> */}
                    <Select
                        placeholder="Lọc sao"
                        allowClear
                        style={{ width: 120 }}
                        value={starRating}
                        onChange={(value) => {
                            setStarRating(value); // value sẽ là số hoặc undefined
                            setPage(1);
                        }}
                    >
                        <Option value={undefined}>Tất cả</Option>
                        {[5, 4, 3, 2, 1].map((star) => (
                            <Option key={star} value={star}>
                                {star} ★
                            </Option>
                        ))}
                    </Select>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={evaluates}
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

            <Modal
                open={isModalOpen}
                title="Chi tiết đánh giá"
                footer={null}
                onCancel={() => setIsModalOpen(false)}
            >
                {selectedEvaluate && (
                    <Descriptions bordered column={1} size="middle" labelStyle={{ fontWeight: 'bold' }}>
                        <Descriptions.Item label="Sản phẩm">
                            {selectedEvaluate?.productID?.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Họ tên">{selectedEvaluate.fullName}</Descriptions.Item>
                        <Descriptions.Item label="Điện thoại">{selectedEvaluate.phone}</Descriptions.Item>
                        <Descriptions.Item label="Email">{selectedEvaluate.email}</Descriptions.Item>
                        <Descriptions.Item label="Nội dung">{selectedEvaluate.contentEvaluate}</Descriptions.Item>
                        <Descriptions.Item label="Số sao">{selectedEvaluate.starRating} ★</Descriptions.Item>
                        <Descriptions.Item label="Hiển thị">
                            <Tag color={selectedEvaluate.isShow ? 'green' : 'red'}>
                                {selectedEvaluate.isShow ? 'Hiện' : 'Ẩn'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {moment(selectedEvaluate.createdAt).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cập nhật">
                            {moment(selectedEvaluate.updatedAt).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default EvaluateList;