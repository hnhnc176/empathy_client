import styles from '../../style';
import React, { Fragment, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';

export default function SideMenu() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

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

    return (
        <div className="body_contain flex flex-col px-10 py-10 items-center justify-start w-fit h-screen bg-[#FCFCF4] border-r-[2px] border-[#123E23]">
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
    );
}