import styles from '../../style';
import React, { Fragment, useRef, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { AlignJustify, X } from 'lucide-react';

export default function SideMenu() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { path: '/admin', label: 'Dashboard' },
        { path: '/admin/users', label: 'Users' },
        { path: '/admin/posts', label: 'Posts' },
        { path: '/admin/reports', label: 'Reports' },
        { path: '/admin/notifications', label: 'Notifications' },
        { 
            path: '#', 
            label: 'Logout',
            onClick: () => {
                try {
                    dispatch(logout());
                    navigate('/home');
                    showSuccessToast('Logged out successfully');
                } catch (error) {
                    console.error('Error during logout:', error);
                    showErrorToast('Logout failed');
                }
            }
        }
    ];

    const isActive = (path) => location.pathname === path;

    const handleMenuItemClick = (item) => {
        if (item.onClick) {
            item.onClick();
        }
        setIsMobileMenuOpen(false); // Close mobile menu after selection
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button 
                className="lg:hidden fixed top-4 left-4 z-50 bg-[#123E23] !text-[#F0F4E6] p-3 rounded-lg shadow-lg"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                color='#ffffff'
            >
                {isMobileMenuOpen ? (
                    <X className="w-5 h-5" color='#ffffff'/>
                ) : (
                    <AlignJustify className="w-5 h-5" color='#ffffff' />
                )}
            </button>

            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                    color='#ffffff'
                />
            )}

            {/* Mobile Menu */}
            <div className={`
                lg:hidden fixed top-0 left-0 h-full w-80 bg-[#FCFCF4] border-r-[2px] border-[#123E23] z-40 
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col px-6 py-6 items-center justify-start h-full">
                    <div className="logo text-[32px] mb-8" style={{ fontFamily: styles.font.logo }}>
                        Empathy
                    </div>
                    <ul className="dashboard w-full text-lg flex flex-col items-start justify-start gap-6 border-t-[2px] border-t-[#123E23] pt-6">
                        {menuItems.map((item) => (
                            <li 
                                key={item.path}
                                className={`
                                    flex items-center justify-start p-[14px_20px] rounded-[8px] w-full
                                    transition-all duration-200 cursor-pointer
                                    ${isActive(item.path) 
                                        ? 'bg-[#123E23] text-[#F0F4E6]' 
                                        : 'hover:bg-[#123E23] group'
                                    }
                                `}
                                onClick={() => handleMenuItemClick(item)}
                            >
                                {item.onClick ? (
                                    <span className={`
                                        w-full
                                        ${isActive(item.path) 
                                            ? '!text-[#F0F4E6]' 
                                            : '!text-[#123E23] group-hover:!text-[#F0F4E6]'
                                        }
                                    `}>
                                        {item.label}
                                    </span>
                                ) : (
                                    <Link 
                                        to={item.path}
                                        className={`
                                            dashboard_link w-full
                                            ${isActive(item.path) 
                                                ? '!text-[#F0F4E6]' 
                                                : '!text-[#123E23] group-hover:!text-[#F0F4E6]'
                                            }
                                        `}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Desktop Menu - Your Exact Original Design */}
            <div className="body_contain hidden lg:flex flex-col px-10 py-10 items-center justify-start w-fit h-screen bg-[#FCFCF4] border-r-[2px] border-[#123E23]">
                <div className="logo text-[40px]" style={{ fontFamily: styles.font.logo }}>
                    Empathy
                </div>
                <ul className="dashboard w-full mx-10 text-xl mt-10 flex flex-col items-start justify-start gap-10 border-t-[3px] border-t-[#123E23] pt-10">
                    {menuItems.map((item) => (
                        <li 
                            key={item.path}
                            className={`
                                flex items-center justify-start p-[18px_24px] rounded-[10px] w-full
                                transition-all duration-200 cursor-pointer
                                ${isActive(item.path) 
                                    ? 'bg-[#123E23] text-[#F0F4E6]' 
                                    : 'hover:bg-[#123E23] group'
                                }
                            `}
                            onClick={item.onClick}
                        >
                            {item.onClick ? (
                                <span className={`
                                    w-full
                                    ${isActive(item.path) 
                                        ? '!text-[#F0F4E6]' 
                                        : '!text-[#123E23] group-hover:!text-[#F0F4E6]'
                                    }
                                `}>
                                    {item.label}
                                </span>
                            ) : (
                                <Link 
                                    to={item.path}
                                    className={`
                                        dashboard_link w-full
                                        ${isActive(item.path) 
                                            ? '!text-[#F0F4E6]' 
                                            : '!text-[#123E23] group-hover:!text-[#F0F4E6]'
                                        }
                                    `}
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}