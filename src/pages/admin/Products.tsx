import React, { useEffect, useState } from 'react';
import {
  Table, Tag, Space, Button, Modal,
  Form, Input, InputNumber, Select, message,
  Upload, Row, Col
} from 'antd';
import {
  getProductApi,
  updateProductApi,
  createProductApi,
  deleteProductApi
} from '../../api/products';
import { getProductFeatureApi } from '../../api/product_features';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';

const { Option } = Select;

const Products: React.FC = () => {
  const [dataProduct, setDataProduct] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search] = useState<string>('');
  const [sort] = useState<string>(''); // 'asc' | 'desc' | ''
  const urlImg = import.meta.env.VITE_API_IMG_URL;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [form] = Form.useForm();

  const [productFeatures, setProductFeatures] = useState<any[]>([]);

  const editor = useEditor({
    extensions: [StarterKit, Link, Image, TextAlign.configure({
      types: ['heading', 'paragraph'],
    })],
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      form.setFieldsValue({ detail: html });
    },
  });

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/img/upload`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.message === 'Success') {
        editor?.chain().focus().setImage({ src: `${urlImg}/${result?.file?.filename}` }).run();
        message.success('Tải ảnh thành công!');
      } else {
        throw new Error('Không có URL trả về');
      }
    } catch (error) {
      console.error(error);
      message.error('Tải ảnh thất bại!');
    }
  };

  const columns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Giá gốc',
      dataIndex: 'realPrice',
      key: 'realPrice',
      render: (price: number) => `${price.toLocaleString('vi-VN')}₫`,
    },
    {
      title: 'Giá khuyến mãi',
      dataIndex: 'promotionalPrice',
      key: 'promotionalPrice',
      render: (price: number) => `${price.toLocaleString('vi-VN')}₫`,
    },
    {
      title: 'Thời gian bảo hành',
      dataIndex: 'warrantyPeriod',
      key: 'warrantyPeriod',
      render: (period: string) => `${period} tháng`,
    },
    {
      title: 'Tính năng',
      dataIndex: 'feature',
      key: 'feature',
      render: (feature: string) => {
        let parsed = {};
        try {
          parsed = JSON.parse(feature);
        } catch {
          parsed = {};
        }
        return (
          <>
            {Object.entries(parsed).map(([group, value]: any) => (
              <Tag key={group} color="blue">{`${group}: ${value}`}</Tag>
            ))}
          </>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? 'Còn hàng' : 'Hết hàng'}
        </Tag>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="primary" onClick={() => showEditModal(record)}>Sửa</Button>
          <Button type="primary" onClick={() => deleteProduct(record)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  const callApiGetProduct = async (
    pageProduct: number,
    limitProduct: number,
    searchText = '',
    sortValue = ''
  ) => {
    try {
      const result = await getProductApi({
        page: pageProduct,
        limit: limitProduct,
        search: searchText,
        sort: sortValue,
      });
      setDataProduct(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    }
  };

  const  deleteProduct= async(record: any) => {
    const result = await deleteProductApi(record?._id)
    if(result?.success) {
       message.success('Xóa sản phẩm thành công');
    }
  }

  const showEditModal = (record: any) => {
    if (record.images.length !== 0) {
      const initialImages: any = record.images.split(',') || [];
      const converted = initialImages.map((imageName: any, index: any) => ({
        uid: `-old-${index}`,
        name: imageName,
        status: 'done',
        url: `${urlImg}/${imageName}`,
      }));
      setFileList(converted);
    }

    setIsEditMode(true);
    setSelectedProduct(record);

    const featuresParsed = record.feature ? JSON.parse(record.feature) : {};
    form.setFieldsValue({ ...record, feature: featuresParsed });
    setIsModalOpen(true);
  };

  const showAddModal = () => {
    setIsEditMode(false);
    setSelectedProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setFileList([]);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Validate tính năng không bỏ trống
      const selectedFeatures = values.feature || {};
      const missingFeatures = productFeatures.filter((f) => !selectedFeatures[f.nameFeature]);
      if (missingFeatures.length > 0) {
        message.error(`Bạn chưa chọn đủ tính năng: ${missingFeatures.map(f => f.nameFeature).join(', ')}`);
        return;
      }

      values.feature = JSON.stringify(values.feature);

      let result;
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value as any);
      });

      const oldImageList: string[] = [];
      fileList.forEach((file: any) => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj as Blob);
        } else {
          oldImageList.push(file.name);
        }
      });
      if (oldImageList.length > 0) {
        formData.append('oldImages', oldImageList.join(','));
      }

      if (isEditMode && selectedProduct) {
        result = await updateProductApi(selectedProduct._id, formData);
      } else {
        result = await createProductApi(formData);
      }

      if (result.success === true) {
        message.success(isEditMode ? 'Cập nhật thành công' : 'Thêm sản phẩm thành công');
        setIsModalOpen(false);
        callApiGetProduct(page, limit, search, sort);
        form.resetFields();
      } else {
        message.error('Thao tác thất bại');
      }
    } catch (error) {
      console.error('Lỗi xử lý:', error);
    }
  };

  useEffect(() => {
    callApiGetProduct(page, limit, search, sort);
  }, [page, limit, search, sort]);

  useEffect(() => {
    if (isModalOpen) {
      (async () => {
        try {
          const res = await getProductFeatureApi({ isShow: 1 });
          setProductFeatures(res.data || []);
        } catch (err) {
          console.error('Lỗi tải tính năng:', err);
        }
      })();
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (editor && isModalOpen) {
      const detailValue = form.getFieldValue('detail') || '<p></p>';
      editor.commands.setContent(detailValue);
    }
  }, [editor, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen && editor) {
      editor.commands.clearContent();
    }
  }, [isModalOpen, editor]);

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Danh sách sản phẩm</h1>
        <Button type="primary" onClick={showAddModal}>Thêm sản phẩm</Button>
      </div>

      <Table
        columns={columns}
        dataSource={dataProduct}
        rowKey="_id"
        pagination={{
          current: page,
          pageSize: limit,
          total: total,
          onChange: (newPage, newPageSize) => {
            setPage(newPage);
            setLimit(newPageSize);
          },
        }}
      />

      <Modal
        title={isEditMode ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Hủy"
        width={'80%'}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giá gốc"
                name="realPrice"
                rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giá khuyến mãi"
                name="promotionalPrice"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số lượng"
                name="quantity"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Thời gian bảo hành (tháng)"
                name="warrantyPeriod"
                rules={[{ required: true, message: 'Vui lòng nhập thời gian bảo hành!' }]}
              >
                <InputNumber
                  min={1}
                  max={60}
                  style={{ width: '100%' }}
                  addonAfter="tháng"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value={1}>Còn hàng</Option>
                  <Option value={0}>Hết hàng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Mô tả"
                name="description"
              >
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
            <Col span={24}>
              {/* Hiển thị danh sách tính năng */}
              <Form.Item label="Tính năng">
                {productFeatures.map((feature) => (
                  <Form.Item
                    key={feature._id}
                    label={feature.nameFeature}
                    name={['feature', feature.nameFeature]}
                    rules={[{ required: true, message: `Vui lòng chọn ${feature.nameFeature}` }]}
                    noStyle
                  >
                    <Select placeholder={`Chọn ${feature.nameFeature}`}>
                      {feature.valueFeature.split(',').map((val: string) => (
                        <Option key={val.trim()} value={val.trim()}>
                          {val.trim()}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                ))}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Ảnh sản phẩm">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  beforeUpload={() => false}
                  multiple
                >
                  {fileList.length >= 5 ? null : (
                    <div>
                      <PlusOutlined /> <div style={{ marginTop: 8 }}>Tải lên</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Mô tả chi tiết"
                name="detail"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả chi tiết' }]}
              >
                <>
                  {/* Toolbar */}
                  <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {/* Bold */}
                    <Button
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      disabled={!editor?.can().chain().focus().toggleBold().run()}
                      type={editor?.isActive('bold') ? 'primary' : 'default'}
                    >
                      B
                    </Button>

                    {/* Italic */}
                    <Button
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      disabled={!editor?.can().chain().focus().toggleItalic().run()}
                      type={editor?.isActive('italic') ? 'primary' : 'default'}
                    >
                      I
                    </Button>

                    {/* Bullet List */}
                    <Button
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      type={editor?.isActive('bulletList') ? 'primary' : 'default'}
                    >
                      Bullet List
                    </Button>

                    {/* Link */}
                    <Button
                      onClick={() => {
                        const url = prompt('Nhập URL liên kết:');
                        if (url) {
                          editor?.chain().focus().setLink({ href: url }).run();
                        }
                      }}
                    >
                      Link
                    </Button>

                    {/* Headings */}
                    <Button
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                      type={editor?.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
                    >
                      H1
                    </Button>
                    <Button
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                      type={editor?.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
                    >
                      H2
                    </Button>
                    <Button
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                      type={editor?.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
                    >
                      H3
                    </Button>

                    {/* Align Center */}
                    <Button
                      onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                      type={editor?.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}
                    >
                      Center
                    </Button>

                    {/* Align Left */}
                    <Button
                      onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                      type={editor?.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}
                    >
                      Left
                    </Button>

                    {/* Align Right */}
                    <Button
                      onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                      type={editor?.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}
                    >
                      Right
                    </Button>

                    {/* Upload Image */}
                    <Upload
                      showUploadList={false}
                      customRequest={({ file }) => uploadImage(file as File)}
                    >
                      <Button icon={<UploadOutlined />}>Thêm Ảnh</Button>
                    </Upload>
                  </div>


                  {/* Editor */}
                  <div
                    style={{
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                      padding: 8,
                      minHeight: 200,
                    }}
                  >
                    <EditorContent editor={editor} className='classEditer' />
                  </div>
                </>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;
