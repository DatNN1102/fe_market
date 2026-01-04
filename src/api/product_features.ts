import axiosInstance from './index';

// 📌 GET tất cả product features (có hỗ trợ params filter, pagination)
export const getProductFeatureApi = async (params?: any): Promise<any> => {
  const response = await axiosInstance.get('/product-features', {
    params,
  });
  return response.data;
};

// 📌 GET 1 product feature theo ID
export const getProductFeatureByIdApi = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/product-features/${id}`);
  return response.data;
};

// 📌 POST thêm mới product feature
export const addProductFeatureApi = async (data: any): Promise<any> => {
  const response = await axiosInstance.post('/product-features', data);
  return response.data;
};

// 📌 PUT cập nhật product feature theo ID
export const updateProductFeatureApi = async (id: string, data: any): Promise<any> => {
  const response = await axiosInstance.put(`/product-features/${id}`, data);
  return response.data;
};

// 📌 DELETE xoá product feature theo ID
export const deleteProductFeatureApi = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/product-features/${id}`);
  return response.data;
};
