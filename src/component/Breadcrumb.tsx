// src/components/Breadcrumb.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    return (
        <div className='over box_shadow_bottom'>
            <div className='ctnCustom'>
                <nav className="text-sm text-gray-600 my-4" aria-label="breadcrumb">
                    <ol className="flex items-center space-x-2">
                        <li>
                            <Link to="/" className="flex items-center space-x-1 hover:text-blue-500">
                                <HomeOutlined />
                                <span className="ml-1">Trang chủ</span>
                            </Link>
                        </li>
                        {items.map((item, index) => (
                            <li key={index} className="flex items-center space-x-2">
                                <span className="mx-1">/</span>
                                {item.path ? (
                                    <Link to={item.path} className="hover:text-blue-500">
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span className="text-gray-500">{item.label}</span>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            </div>
        </div>
    );
};

export default Breadcrumb;
