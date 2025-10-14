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
            {/* Mobile Header */}
            <div className="lg:hidden px-4 py-3 flex items-center justify-between relative z-50" 
                 style={{ backgroundColor: styles.colors.background, borderBottom: `2px solid ${styles.colors.primary}` }}>
                {/* Logo */}
                <div className="text-[28px]" style={{ fontFamily: styles.font.logo, color: styles.colors.primary }}>
                    Empathy
                </div>
                
                {/* Hamburger Menu Button */}
                <button 
                    className="p-2 rounded-lg transition-colors hover:bg-opacity-90"
                    style={{ 
                        color: styles.colors.primary,
                        ':hover': {
                            backgroundColor: styles.colors.primary,
                            color: styles.colors.secodary
                        }
                    }}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <AlignJustify className="w-6 h-6" />
                    )}
                </button>
                
                {/* Mobile Dropdown Menu */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 shadow-lg" 
                         style={{ backgroundColor: styles.colors.background, borderBottom: `2px solid ${styles.colors.primary}` }}>
                        <ul className="py-2">
                            {menuItems.map((item) => (
                                <li key={item.path}>
                                    {item.onClick ? (
                                        <button
                                            className="w-full text-left px-4 py-3 transition-colors"
                                            style={{
                                                backgroundColor: isActive(item.path) ? styles.colors.primary : 'transparent',
                                                color: isActive(item.path) ? styles.colors.secodary : styles.colors.primary
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive(item.path)) {
                                                    e.target.style.backgroundColor = styles.colors.primary;
                                                    e.target.style.color = styles.colors.secodary;
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive(item.path)) {
                                                    e.target.style.backgroundColor = 'transparent';
                                                    e.target.style.color = styles.colors.primary;
                                                }
                                            }}
                                            onClick={() => handleMenuItemClick(item)}
                                        >
                                            {item.label}
                                        </button>
                                    ) : (
                                        <Link
                                            to={item.path}
                                            className="block px-4 py-3 transition-colors"
                                            style={{
                                                backgroundColor: isActive(item.path) ? styles.colors.primary : 'transparent',
                                                color: isActive(item.path) ? styles.colors.secodary : styles.colors.primary
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive(item.path)) {
                                                    e.target.style.backgroundColor = styles.colors.primary;
                                                    e.target.style.color = styles.colors.secodary;
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive(item.path)) {
                                                    e.target.style.backgroundColor = 'transparent';
                                                    e.target.style.color = styles.colors.primary;
                                                }
                                            }}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>



            {/* Desktop Menu - Your Exact Original Design */}
            <div className="body_contain hidden lg:flex flex-col px-10 py-10 items-center justify-start w-fit h-screen border-r-[2px]" 
                 style={{ backgroundColor: styles.colors.background, borderColor: styles.colors.primary }}>
                <div className="logo text-[40px]" style={{ fontFamily: styles.font.logo, color: styles.colors.primary }}>
                    Empathy
                </div>
                <ul className="dashboard w-full mx-10 text-xl mt-10 flex flex-col items-start justify-start gap-10 border-t-[3px] pt-10"
                    style={{ borderColor: styles.colors.primary }}>
                    {menuItems.map((item) => (
                        <li 
                            key={item.path}
                            className="flex items-center justify-start p-[18px_24px] rounded-[10px] w-full transition-all duration-200 cursor-pointer"
                            style={{
                                backgroundColor: isActive(item.path) ? styles.colors.primary : 'transparent'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive(item.path)) {
                                    e.currentTarget.style.backgroundColor = styles.colors.primary;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive(item.path)) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                            onClick={item.onClick}
                        >
                            {item.onClick ? (
                                <span className="w-full"
                                      style={{
                                          color: isActive(item.path) ? styles.colors.secodary : styles.colors.primary
                                      }}
                                      onMouseEnter={(e) => {
                                          if (!isActive(item.path)) {
                                              e.target.style.color = styles.colors.secodary;
                                          }
                                      }}
                                      onMouseLeave={(e) => {
                                          if (!isActive(item.path)) {
                                              e.target.style.color = styles.colors.primary;
                                          }
                                      }}>
                                    {item.label}
                                </span>
                            ) : (
                                <Link 
                                    to={item.path}
                                    className="dashboard_link w-full"
                                    style={{
                                        color: isActive(item.path) ? styles.colors.secodary : styles.colors.primary
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive(item.path)) {
                                            e.target.style.color = styles.colors.secodary;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive(item.path)) {
                                            e.target.style.color = styles.colors.primary;
                                        }
                                    }}
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