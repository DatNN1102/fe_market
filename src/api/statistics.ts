import axiosInstance from './index';

interface StatisticsParams {
  type?: string;
  from?: string;
  to?: string;
}

export const getStatisticsApi = async (params?: StatisticsParams): Promise<any> => {
  const response = await axiosInstance.get('/statistics', {
    params,
  });
  return response.data;
};