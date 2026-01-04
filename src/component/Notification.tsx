import { notification } from 'antd';
import React from 'react';
type NotificationType = 'success' | 'info' | 'warning' | 'error';

const Notification: React.FC = () => {
    const [api, contextHolder] = notification.useNotification();
    const openNotificationWithIcon = (type: NotificationType) => {
        api[type]({
            message: 'Đăng nhập thành công!',
            description:
                'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
        });
    };

    return (
        <div>
            {contextHolder}
        </div>
    )
}

export default Notification;