import axiosInstance from './index';

interface GetUserParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const LoginApi = async (data: any): Promise<any> => {
  const response = await axiosInstance.post('/login', data);
  return response.data;
};

export const signUpApi = async (data: any): Promise<any> => {
  const response = await axiosInstance.post('/register', data);
  return response.data;
};

export const getUserApi = async (params: GetUserParams = {}): Promise<any> => {
  const response = await axiosInstance.get('/users', { params });
  return response.data;
};

export const getProfileApi = async (): Promise<any> => {
  const response = await axiosInstance.get('/me');
  return response.data;
};

export const changePassApi = async (data: any): Promise<any> => {
  const response = await axiosInstance.post('/change-password', data);
  return response.data;
};

export const changeInfoApi = async (data: any): Promise<any> => {
  const response = await axiosInstance.put('/update-profile', data);
  return response.data;
};
