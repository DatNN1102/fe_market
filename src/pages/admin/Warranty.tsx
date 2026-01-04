import React, { useEffect, useState } from 'react';
import {
    Table,
    Tag,
    Modal,
    Descriptions,
    message,
    Select,
    Input,
    Button,
    Form,
    DatePicker,
    InputNumber,
    Row,
    Col
} from 'antd';
import { getWarrantyApi, updateWarrantyApi } from '../../api/warranty';
import moment from 'moment';
import useInfo from '../../hook/useInfo';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons'

const { Option } = Select;
const { Search } = Input;

const Warranty: React.FC = () => {
    const [warranties, setWarranties] = useState<any[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [selectedWarranty, setSelectedWarranty] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchCode, setSearchCode] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const [form] = Form.useForm();
    const { dataInfo } = useInfo()

    const fetchData = async () => {
        try {
            const result = await getWarrantyApi({
                page,
                limit,
                warrantyCode: searchCode,
                status: statusFilter
            });
            setWarranties(result.data);
            setTotal(result.total);
        } catch (error) {
            console.error('Lỗi tải đơn bảo hành:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, limit, searchCode, statusFilter]);

    const handleView = (record: any) => {
        setSelectedWarranty(record);
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setSelectedWarranty(record);
        form.setFieldsValue({
            ...record,
            processingStaff: dataInfo?.fullName,
            purchaseDate: moment(record.purchaseDate),
            warrantyExpiryDate: moment(record.warrantyExpiryDate),
            receivedDate: moment(record.receivedDate),
            returnDate: record.returnDate ? moment(record.returnDate) : null,
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                purchaseDate: values.purchaseDate,
                warrantyExpiryDate: values.warrantyExpiryDate,
                receivedDate: values.receivedDate,
                returnDate: values.returnDate ? values.returnDate : null,
            };
            await updateWarrantyApi(selectedWarranty._id, payload);
            message.success('Cập nhật đơn bảo hành thành công!');
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) {
            message.error('Lỗi khi cập nhật đơn bảo hành');
        }
    };

    const columns = [
        {
            title: 'Mã bảo hành',
            dataIndex: 'warrantyCode',
            key: 'warrantyCode',
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customerName',
            key: 'customerName',
        },
        {
            title: 'Điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (value: string) => (
                // <Dropdown
                //     trigger={['click']}
                //     menu={{
                //         onClick: ({ key }) => {
                //             if (key === value) return;
                //             handleUpdateStatus(record, key);
                //         },
                //         items: ['Đang xử lý', 'Đã hoàn thành', 'Từ chối'].map(status => ({
                //             key: status,
                //             label: status,
                //             disabled: value === status,
                //         })),
                //     }}
                // >
                // </Dropdown>
                    <Tag
                        color={
                            value === 'Đã hoàn thành'
                                ? 'green'
                                : value === 'Từ chối'
                                    ? 'red'
                                    : 'blue'
                        }
                    >
                        {value}
                    </Tag>
            ),
        },
        {
            title: 'Ngày nhận',
            dataIndex: 'receivedDate',
            key: 'receivedDate',
            render: (date: string) => moment(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: any) => (
                <div className="flex gap-2">
                    <Button type='primary' onClick={() => handleView(record)}>Xem</Button>
                    <Button disabled={record?.status !== 'Đang xử lý'} onClick={() => handleEdit(record)}>Tiếp nhận BH</Button>
                </div>
            ),
        },
    ];

    return (
        <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-4 gap-2">
                <h1 className="text-2xl font-bold">Danh sách đơn bảo hành</h1>
                <div className="flex gap-2">
                    <Search
                        placeholder="Tìm mã bảo hành"
                        allowClear
                        onSearch={(value) => {
                            setSearchCode(value);
                            setPage(1);
                        }}
                        style={{ width: 220 }}
                    />
                    <Select
                        placeholder="Lọc trạng thái"
                        allowClear
                        style={{ width: 160 }}
                        value={statusFilter}
                        onChange={(value) => {
                            setStatusFilter(value);
                            setPage(1);
                        }}
                    >
                        <Option value={undefined}>Tất cả</Option>
                        <Option value="Đang xử lý">Đang xử lý</Option>
                        <Option value="Đã hoàn thành">Đã hoàn thành</Option>
                        <Option value="Từ chối">Từ chối</Option>
                    </Select>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={warranties}
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

            {/* Modal xem */}
            <Modal
                open={isModalOpen}
                title="Chi tiết đơn bảo hành"
                footer={null}
                onCancel={() => setIsModalOpen(false)}
                width={'80%'}
            >
                {selectedWarranty && (
                    <Descriptions bordered column={2} size="middle" labelStyle={{ fontWeight: 'bold' }}>
                        <Descriptions.Item label="Sản phẩm">{selectedWarranty.productName}</Descriptions.Item>
                        <Descriptions.Item label="Mã bảo hành">{selectedWarranty.warrantyCode}</Descriptions.Item>
                        <Descriptions.Item label="Số lượng">{selectedWarranty.numberProduct}</Descriptions.Item>
                        <Descriptions.Item label="Khách hàng">{selectedWarranty.customerName}</Descriptions.Item>
                        <Descriptions.Item label="Điện thoại">{selectedWarranty.phone}</Descriptions.Item>
                        <Descriptions.Item label="Email">{selectedWarranty.email}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">{selectedWarranty.address}</Descriptions.Item>
                        <Descriptions.Item label="Ghi chú của khách hàng">{selectedWarranty.customerNotes}</Descriptions.Item>
                        <Descriptions.Item label="Ngày mua">{moment(selectedWarranty.purchaseDate).format('DD/MM/YYYY')}</Descriptions.Item>
                        <Descriptions.Item label="Ngày hết hạn">{moment(selectedWarranty.warrantyExpiryDate).format('DD/MM/YYYY')}</Descriptions.Item>
                        <Descriptions.Item label="Hạn bảo hành">{selectedWarranty.warrantyPeriod}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">{selectedWarranty.status}</Descriptions.Item>
                        <Descriptions.Item label="Ngày nhận">{moment(selectedWarranty.receivedDate).format('DD/MM/YYYY')}</Descriptions.Item>
                        <Descriptions.Item label="Serial Number">{selectedWarranty.serialNumber}</Descriptions.Item>
                        <Descriptions.Item label="Nhân viên xử lý">{selectedWarranty.processingStaff}</Descriptions.Item>
                        <Descriptions.Item label="Mô tả lỗi">{selectedWarranty.issueDescription}</Descriptions.Item>
                        <Descriptions.Item label="Kết quả bảo hành">{selectedWarranty.warrantyResult}</Descriptions.Item>
                        <Descriptions.Item label="Ghi chú của nhân viên">{selectedWarranty.staffNotes}</Descriptions.Item>
                        <Descriptions.Item label="Ngày trả">{selectedWarranty.returnDate ? moment(selectedWarranty.returnDate).format('DD/MM/YYYY') : 'Chưa trả'}</Descriptions.Item>
                        <Descriptions.Item label="Tạo lúc">{moment(selectedWarranty.TimeCreate).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                        <Descriptions.Item label="Cập nhật lúc">{moment(selectedWarranty.TimeUpdate).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>

            {/* Modal sửa */}
            <Modal
                open={isEditModalOpen}
                title="Tiếp nhận đơn bảo hành"
                onOk={handleEditSubmit}
                onCancel={() => setIsEditModalOpen(false)}
                okText="Xác nhận"
                cancelText="Hủy"
                width={800}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        {/* Cột trái */}
                        <Col span={12}>
                            <Form.Item label="Mã bảo hành" name="warrantyCode">
                                <Input disabled />
                            </Form.Item>
                            <Form.Item label="Khách hàng" name="customerName">
                                <Input disabled />
                            </Form.Item>
                            <Form.Item label="Ngày mua" name="purchaseDate">
                                <DatePicker disabled style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item label="Hạn bảo hành" name="warrantyPeriod">
                                <InputNumber disabled min={1} max={60} addonAfter="tháng" style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item label="Ngày hết hạn" name="warrantyExpiryDate">
                                <DatePicker disabled style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item label="Ngày nhận" name="receivedDate" rules={[{ required: true, message: 'Vui lòng chọn ngày nhận' }]}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item label="Trạng thái" name="status">
                                <Select>
                                    <Option value="Đang xử lý">Đang xử lý</Option>
                                    <Option value="Đã hoàn thành">Đã hoàn thành</Option>
                                    <Option value="Từ chối">Từ chối</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item label="Nhân viên xử lý" name="processingStaff">
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label={
                                    <span>
                                        Mô tả lỗi&nbsp;
                                        <Tooltip title="Nhập mô tả lỗi chi tiết để nhân viên dễ xử lý (ví dụ: Không lên nguồn, báo lỗi E1,...)">
                                            <QuestionCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
                                        </Tooltip>
                                    </span>
                                }
                                name="issueDescription"
                            >
                                <Input.TextArea rows={3} />
                            </Form.Item>
                        </Col>

                        {/* Cột phải */}
                        <Col span={12}>
                            <Form.Item label="Sản phẩm" name="productName">
                                <Input disabled />
                            </Form.Item>
                            <Form.Item label="Điện thoại" name="phone">
                                <Input disabled />
                            </Form.Item>
                            <Form.Item label="Email" name="email">
                                <Input disabled />
                            </Form.Item>
                            <Form.Item label="Địa chỉ" name="address">
                                <Input disabled />
                            </Form.Item>
                            <Form.Item label="Ghi chú của khách hàng" name="customerNotes">
                                <Input.TextArea disabled rows={1} />
                            </Form.Item>
                            <Form.Item label="Serial Number" name="serialNumber" rules={[{ required: true, message: 'Vui lòng nhập serial sản phẩm' }]}>
                                <Input />
                            </Form.Item>
                            
                            <Form.Item
                                label={
                                    <span>
                                        Kết quả bảo hành&nbsp;
                                        <Tooltip title="Nhập kết quả bảo hành (ví dụ: Đã sửa, Đổi mới, Từ chối...)">
                                            <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                                        </Tooltip>
                                    </span>
                                }
                                name="warrantyResult"
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item label="Ngày trả" name="returnDate">
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item label="Ghi chú của nhân viên" name="staffNotes">
                                <Input.TextArea rows={3} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

        </div>
    );
};

export default Warranty;
