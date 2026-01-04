import axiosInstance from './index';

export interface TransactionParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  status?: string;
  userId?: string;
  [key: string]: any; // linh hoạt
}

export interface Transaction {
  id: string;
  code: string;
  userId: string;
  phone: string;
  address: string;
  email: string;
  status: string;
  isShow: boolean;
  note?: string;
  details?:any[];
  paymentMethod: string;
  totalPrice: number;
  timeCreate: string;
  timeUpdate?: string;
}

export const getTransactionApi = async (params?: TransactionParams): Promise<any> => {
  const response = await axiosInstance.get('/transaction', { params });
  return response.data;
};

export const getDetailTransactionApi = async (code?: string): Promise<any> => {
  const response = await axiosInstance.get(`/transaction/${code}`);
  return response.data;
};

export const getMyOrderApi = async (params?: TransactionParams): Promise<any> => {
  const response = await axiosInstance.get('/transaction/my-orders', { params });
  return response.data;
};

export const updateTransactionApi = async (id: string, data: Partial<Transaction>): Promise<any> => {
  const response = await axiosInstance.put(`/transaction/${id}`, data);
  return response.data;
};


export const createTransactionApi = async (data?: TransactionParams): Promise<any> => {
  const response = await axiosInstance.post('/transaction', data);
  return response.data;
};