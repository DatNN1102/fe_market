import axiosInstance from './index';

interface ProductParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  [key: string]: any; // cho phép các param khác linh hoạt
}

export const getProductApi = async (params?: ProductParams): Promise<any> => {
  const response = await axiosInstance.get('/products', {
    params,
  });
  return response.data;
};

export const getProductDetailApi = async (id?: string): Promise<any> => {
  const response = await axiosInstance.get('/products/' + id);
  return response.data;
};

export const createProductApi = async (data?: ProductParams): Promise<any> => {
  const response = await axiosInstance.post('/products', data);
  return response.data;
};

export const updateProductApi = async (id: string, data: any): Promise<any> => {
  const response = await axiosInstance.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProductApi = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
};

export const getProductRecommendlApi = async (id?: string): Promise<any> => {
  const response = await axiosInstance.get('/products/recommend/' + id);
  return response.data;
};
