import axiosInstance from './index';

interface WarrantyParams {
  page?: number;
  limit?: number;
  warrantyCode?: string;
  phone?: string;
  status?: string;
  productName?: string;
  customerName?: string;
  receivedDate?: string;
}

interface WarrantyData {
  productName?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyPeriod?: string;
  warrantyExpiryDate?: string;
  customerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  customerNotes?: string;
  warrantyCode?: string;
  issueDescription?: string;
  receivedDate?: string;
  status?: string;
  processingStaff?: string;
  warrantyResult?: string;
  returnDate?: string;
  staffNotes?: string;
}

export const getWarrantyApi = async (params?: WarrantyParams): Promise<any> => {
  const response = await axiosInstance.get('/warranty', {
    params,
  });
  return response.data;
};

export const getMyWarrantyApi = async (params?: any): Promise<any> => {
  const response = await axiosInstance.get(`/warranty/my-warranties`, {
    params
  });
  return response.data;
};

export const getWarrantyByIdApi = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/warranty/${id}`);
  return response.data;
};

export const createWarrantyApi = async (data: WarrantyData): Promise<any> => {
  const response = await axiosInstance.post('/warranty', data);
  return response.data;
};

export const updateWarrantyApi = async (id: string, data: Partial<WarrantyData>): Promise<any> => {
  const response = await axiosInstance.put(`/warranty/${id}`, data);
  return response.data;
};

export const deleteWarrantyApi = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/warranty/${id}`);
  return response.data;
};
