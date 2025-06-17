import React, { useState, useEffect } from 'react';
import styles from '../style'
import axiosInstance from '../config/axios';
import { useSelector } from 'react-redux';

export default function ProfilePic() {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [userInfo, setUserInfo] = useState({
        username: '',
        email: '',
        fullname: '',
        phoneNo:'',
        bio: '',
        created_at: null,
        social_links: {
            website: null,
            twitter: null,
            facebook: null,
            instagram: null,
            linkedin: null,
            github: null
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                setLoading(true);
                setError(null);

                // Check if user is authenticated
                if (!isAuthenticated) {
                    setError('Please log in to view profile information.');
                    setLoading(false);
                    return;
                }

                // Get user ID from Redux state or localStorage
                let userId = user?.id || user?._id;

                if (!userId) {
                    // Fallback: try to get from localStorage
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        try {
                            const parsedUser = JSON.parse(storedUser);
                            userId = parsedUser.id || parsedUser._id;
                        } catch (parseError) {
                            console.error('Error parsing stored user:', parseError);
                        }
                    }
                }

                if (!userId) {
                    setError('User ID not found. Please log in again.');
                    setLoading(false);
                    return;
                }

                // Fetch user basic info
                const userResponse = await axiosInstance.get(`/api/users/${userId}`);

                // Fetch user settings (including social links)
                let socialLinks = {};
                try {
                    const settingsResponse = await axiosInstance.get(`/api/settings/${userId}`);
                    socialLinks = settingsResponse.data.social_links || {};
                } catch (settingsError) {
                    console.warn('Could not fetch user settings:', settingsError);
                    // Continue without social links if settings endpoint fails
                }

                setUserInfo({
                    ...userResponse.data,
                    social_links: socialLinks
                });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user info:', error);

                if (error.response?.status === 401) {
                    setError('Authentication expired. Please log in again.');
                } else if (error.response?.status === 404) {
                    setError('User not found. Please contact support.');
                } else {
                    setError('Failed to load user information. Please try again.');
                }
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [user, isAuthenticated]);

    if (loading) {
        return (
            <ProfileCard 
                avatarUrl="src/assets/avt.png"
                name="Loading..."
                socialLinks={{}}
            />
        );
    }

    if (error) {
        return (
            <ProfileCard 
                avatarUrl="src/assets/avt.png"
                name="Error loading profile"
                socialLinks={{}}
            />
        );
    }

    return (
        <ProfileCard 
            avatarUrl={userInfo?.avatar || "src/assets/avt.png"}
            name={userInfo?.name || "Username"}
            socialLinks={userInfo.social_links}
        />
    )
}

// Profile Card Component with 3D tilt effect
const ProfileCard = ({ 
    avatarUrl = "src/assets/avt.png",
    name = "Username",
    socialLinks = {},
    enableTilt = true,
    className = ""
}) => {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        if (!enableTilt) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        setTilt({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
    };

    return (
        <div 
            className={`cover-avt w-full sm:w-[280px] lg:w-[320px] h-[300px] sm:h-[400px] lg:h-[500px] bg-[#F0F4E6] flex flex-col items-center justify-center shadow-lg lg:shadow-xl rounded-lg ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: enableTilt ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : 'none',
                transition: 'transform 0.1s ease-out'
            }}
        >
            <div className="avt bg-white w-[85%] sm:w-[80%] h-[85%] sm:h-[80%] p-3 sm:p-4 lg:p-5 shadow-md lg:shadow-lg flex flex-col items-center justify-center rounded-lg">
                <img
                    className="avt-img w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] lg:w-[200px] lg:h-[200px] rounded-full object-cover"
                    src={avatarUrl}
                    alt="avatar"
                />
                <h2
                    className="text-sm sm:text-base lg:text-[16px] !font-bold mt-3 sm:mt-4 lg:mt-5 text-[#123E23] text-center px-2"
                    style={{ fontFamily: styles.font.body }}
                >
                    {name}
                </h2>
                <div className="w-[100px] sm:w-[120px] lg:w-[150px] h-[1px] m-1 sm:m-1.5 lg:m-2"></div>
                <div className="flex justify-center gap-1 sm:gap-1.5 w-full flex-wrap">
                    {socialLinks?.instagram && (
                        <a 
                            href={socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 sm:p-2 rounded-full transition-colors hover:bg-[#123e23]/10"
                        >
                            <i className="fa-brands fa-instagram text-sm sm:text-base lg:fa-lg" style={{ color: '#123e23' }}></i>
                        </a>
                    )}
                    {socialLinks?.twitter && (
                        <a 
                            href={socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 sm:p-2 rounded-full transition-colors hover:bg-[#123e23]/10"
                        >
                            <i className="fa-brands fa-x-twitter text-sm sm:text-base" style={{ color: '#123e23' }}></i>
                        </a>
                    )}
                    {socialLinks?.youtube && (
                        <a 
                            href={socialLinks.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 sm:p-2 rounded-full transition-colors hover:bg-[#123e23]/10"
                        >
                            <i className="fa-brands fa-youtube text-sm sm:text-base lg:fa-lg" style={{ color: '#123e23' }}></i>
                        </a>
                    )}
                    {socialLinks?.facebook && (
                        <a 
                            href={socialLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 sm:p-2 rounded-full transition-colors hover:bg-[#123e23]/10"
                        >
                            <i className="fa-brands fa-facebook-f text-sm sm:text-base lg:fa-lg" style={{ color: '#123e23' }}></i>
                        </a>
                    )}
                    {socialLinks?.linkedin && (
                        <a 
                            href={socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 sm:p-2 rounded-full transition-colors hover:bg-[#123e23]/10"
                        >
                            <i className="fa-brands fa-linkedin-in text-sm sm:text-base lg:fa-lg" style={{ color: '#123e23' }}></i>
                        </a>
                    )}
                    {socialLinks?.github && (
                        <a 
                            href={socialLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 sm:p-2 rounded-full transition-colors hover:bg-[#123e23]/10"
                        >
                            <i className="fa-brands fa-github text-sm sm:text-base lg:fa-lg" style={{ color: '#123e23' }}></i>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}