import { Button } from 'antd';
import React, { useState } from 'react';
import DOMPurify from 'dompurify';


const DetailPay: React.FC = () => {
  const [value] = useState('');

  const button = () => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/vnp/create_payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 100000
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.url) {
          // window.location.href = data.url;
        } else {
          console.error('Không nhận được URL thanh toán hợp lệ:', data);
        }
      })
      .catch(error => {
        console.error('Lỗi kết nối tới server:', error);
      });

  }
  return (
    <div className="over">
      <div className="ctnCustom flex flex-col gap-4">
        Chi tiet thanh toán
        <Button onClick={button}>
          Thanh toán VNP
        </Button>
        <div className="ql-editor"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }}
        ></div>
      </div>
    </div>
  )
};

export default DetailPay;
