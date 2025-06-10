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
    return (
        <div className="cover-avt w-[320px] h-[500px] bg-[#F0F4E6] flex flex-col items-center justify-center shadow-xl">
            <div className="avt bg-white w-[80%] h-[80%] p-5 shadow-lg flex flex-col items-center justify-center">
                <img
                    className="avt-img w-[200px] h-[200px] rounded-full object-cover"
                    src="src/assets/avt.png"
                    alt="avatar"
                />
                <h2
                    className="text-[16px] !font-bold mt-5 text-[#123E23]"
                    style={{ fontFamily: styles.font.body }}
                >
                    {userInfo.username || 'Username'}
                </h2>
                <div className="w-[150px] h-[1px] m-2 "></div>
                <div className="flex justify-center gap-1.5 w-full">
                    {userInfo.social_links?.instagram && (
                        <a 
                            href={userInfo.social_links.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full transition-colors hover:bg-[#123e23]/10"
                        >
                            <i className="fa-brands fa-instagram fa-lg" style={{ color: '#123e23' }}></i>
                        </a>
                    )}
                    {userInfo.social_links?.twitter && (
                        <a 
                            href={userInfo.social_links.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full transition-colors hover:bg-[#123e23]/10"
                        >
                            <i className="fa-brands fa-x-twitter" style={{ color: '#123e23' }}></i>
                        </a>
                    )}
                    {userInfo.social_links?.youtube && (
                        <a 
                            href={userInfo.social_links.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full transition-colors hover:bg-[#123e23]/10"
                        >
                            <i className="fa-brands fa-youtube fa-lg" style={{ color: '#123e23' }}></i>
                        </a>
                    )}
                    {userInfo.social_links?.facebook && (
                        <a 
                            href={userInfo.social_links.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full transition-colors hover:bg-[#123e23]/10"
                        >
                            <i className="fa-brands fa-facebook-f fa-lg" style={{ color: '#123e23' }}></i>
                        </a>
                    )}
                    {userInfo.social_links?.linkedin && (
                        <a 
                            href={userInfo.social_links.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full transition-colors hover:bg-[#123e23]/10"
                        >
                            <i className="fa-brands fa-linkedin-in fa-lg" style={{ color: '#123e23' }}></i>
                        </a>
                    )}
                    {userInfo.social_links?.github && (
                        <a 
                            href={userInfo.social_links.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full transition-colors hover:bg-[#123e23]/10"
                        >
                            <i className="fa-brands fa-github fa-lg" style={{ color: '#123e23' }}></i>
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}