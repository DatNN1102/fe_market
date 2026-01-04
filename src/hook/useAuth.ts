import { useEffect, useState } from 'react';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token'); // hoặc 'accessToken', 'user', tùy ứng dụng
    setIsAuthenticated(!!token);
  }, []);

  return { isAuthenticated };
};

export default useAuth;
