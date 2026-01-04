import axiosInstance from './index';

interface EvaluateParams {
  page?: number;
  limit?: number;
  ProductID?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  contentEvaluate?: string;
  starRating?: number;
}

export const getEvaluateApi = async (params?: EvaluateParams): Promise<any> => {
  const response = await axiosInstance.get('/evaluate', {
    params,
  });
  return response.data;
};

export const getEvaluateByProductApi = async (id?: string): Promise<any> => {
  const response = await axiosInstance.get(`/evaluate/product/${id}`);
  return response.data;
};

export const createEvaluateApi = async (data?: EvaluateParams): Promise<any> => {
  const response = await axiosInstance.post('/evaluate', data);
  return response.data;
};

export const updateEvaluateApi = async (id: string, data: any): Promise<any> => {
  const response = await axiosInstance.put(`/evaluate/${id}`, data);
  return response.data;
};

export const deleteEvaluateApi = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/evaluate/${id}`);
  return response.data;
};
