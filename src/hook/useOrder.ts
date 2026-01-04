import { useEffect, useState } from 'react';

const useOrder = () => {
  const [numberProduct, setNumberProduct] = useState<number>(0);

  useEffect(() => {
    const order = JSON.parse(localStorage.getItem('cart') || '[]');
    setNumberProduct(order.length);
  }, []);

  return { numberProduct };
};

export default useOrder;
