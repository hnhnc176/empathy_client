import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ProfilePic from './ProfilePic';
import { Link } from 'react-router-dom';
import axiosInstance from '../../config/axios';

export default function ProfileInfo() {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [userInfo, setUserInfo] = useState({
        username: '',
        email: '',
        bio: '',
        created_at: null,
        social_links: {
            website: null,
            twitter: null,
            facebook: null,
            instagram: null,
            linkedin: null,
            github: null,
            youtube: null
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                setLoading(true);
                setError(null);
                
                if (!isAuthenticated) {
                    setError('Please log in to view profile information.');
                    setLoading(false);
                    return;
                }

                let userId = user?.id || user?._id;
                
                if (!userId) {
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

                const [userResponse, settingsResponse] = await Promise.all([
                    axiosInstance.get(`/api/users/${userId}`),
                    axiosInstance.get(`/api/settings/${userId}`)
                ]);

                setUserInfo({
                    ...userResponse.data,
                    social_links: settingsResponse.data.data.social_links || {}
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
            <div className="cover-info w-full h-[300px] sm:h-[400px] lg:h-[450px] bg-[#F0F4E6] flex items-center justify-center rounded-[6px]">
                <div className="info w-[95%] sm:w-[90%] h-[250px] sm:h-[320px] lg:h-[350px] flex items-center justify-center bg-[#fff] mx-4 sm:mx-[30px] my-4 sm:my-[20px] rounded-[6px]">
                    <div className="text-[#123E23] text-sm sm:text-base lg:text-lg">Loading user information...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cover-info w-full h-[300px] sm:h-[400px] lg:h-[450px] bg-[#F0F4E6] flex items-center justify-center rounded-[6px]">
                <div className="info w-[95%] sm:w-[90%] h-[250px] sm:h-[320px] lg:h-[350px] flex flex-col items-center justify-center bg-[#fff] mx-4 sm:mx-[30px] my-4 sm:my-[20px] rounded-[6px] gap-4">
                    <div className="text-red-500 text-center px-4 text-sm sm:text-base">{error}</div>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#123E23] text-white rounded hover:bg-opacity-80 text-sm sm:text-base"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cover-info w-full h-auto sm:h-[400px] lg:h-[450px] bg-[#F0F4E6] flex items-center justify-center rounded-[6px] p-4 sm:p-0">
            <div className="info w-full sm:w-[90%] h-auto sm:h-[320px] lg:h-[350px] flex flex-col items-center justify-center bg-[#fff] mx-0 sm:mx-[30px] my-0 sm:my-[20px] rounded-[6px] p-4 sm:p-0">
                <div className="info-1 flex flex-col sm:flex-row items-center justify-center sm:justify-evenly mx-0 sm:mx-[30px] my-4 sm:my-[20px] w-full sm:w-[95%] gap-4 sm:gap-6 lg:gap-[44px]">
                    <div className="picture-pic flex w-20 h-20 sm:w-28 sm:h-24 lg:w-[145px] lg:h-[130px] flex-shrink-0">
                        <img className="picture-pic-img w-full h-full rounded-full sm:rounded-none object-cover" src="src/assets/avt.png" alt="Profile" />
                    </div>
                    <div className="info-profile flex flex-col items-center sm:items-start px-0 sm:px-[30px] py-0 w-full justify-center sm:justify-between gap-4 sm:gap-6 lg:gap-[30px]">
                        <div className="info-name text-lg sm:text-xl lg:text-[30px] flex flex-col sm:flex-row items-center sm:justify-between w-full font-bold text-[#123E23] m-0 gap-2 sm:gap-0">
                            <span className="text-center sm:text-left">@{userInfo.username || 'Username'}</span>
                            <Link to={userInfo.social_links?.website || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                <i className="fa-solid fa-globe fa-xs self-center cursor-pointer" style={{color: '#123e23'}}>
                                    {userInfo.social_links?.website ? ' ' : ''}
                                </i>
                            </Link>
                        </div>
                        <div className="info-links flex !flex-col sm:flex-row justify-center sm:justify-between items-center sm:items-start gap-3 sm:gap-4 lg:gap-[20px] w-full">
                            <div className="info-li-col-1 flex flex-col items-center sm:items-start gap-1 sm:gap-2">
                                {userInfo.social_links?.facebook && (
                                    <div className="info-link flex items-center">
                                        <i className="fa-brands fa-facebook-f" style={{color: '#123e23'}}></i> 
                                        <a href={userInfo.social_links.facebook} target="_blank" rel="noopener noreferrer" className="ml-2 text-[#123e23] hover:underline text-sm sm:text-base">
                                            Facebook
                                        </a>
                                    </div>
                                )}
                                {userInfo.social_links?.instagram && (
                                    <div className="info-link flex items-center">
                                        <i className="fa-brands fa-instagram fa-lg" style={{color: '#123e23'}}></i> 
                                        <a href={userInfo.social_links.instagram} target="_blank" rel="noopener noreferrer" className="ml-2 text-[#123e23] hover:underline text-sm sm:text-base">
                                            Instagram
                                        </a>
                                    </div>
                                )}
                                {userInfo.social_links?.linkedin && (
                                    <div className="info-link flex items-center">
                                        <i className="fa-brands fa-linkedin-in" style={{color: '#123e23'}}></i> 
                                        <a href={userInfo.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="ml-2 text-[#123e23] hover:underline text-sm sm:text-base">
                                            LinkedIn
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div className="info-li-col-1 flex flex-col items-center sm:items-start gap-1 sm:gap-2">
                                {userInfo.social_links?.twitter && (
                                    <div className="info-link flex items-center">
                                        <i className="fa-brands fa-x-twitter" style={{color: '#123e23'}}></i> 
                                        <a href={userInfo.social_links.twitter} target="_blank" rel="noopener noreferrer" className="ml-2 text-[#123e23] hover:underline text-sm sm:text-base">
                                            Twitter
                                        </a>
                                    </div>
                                )}
                                {userInfo.social_links?.github && (
                                    <div className="info-link flex items-center">
                                        <i className="fa-brands fa-github fa-lg" style={{color: '#123e23'}}></i> 
                                        <a href={userInfo.social_links.github} target="_blank" rel="noopener noreferrer" className="ml-2 text-[#123e23] hover:underline text-sm sm:text-base">
                                            GitHub
                                        </a>
                                    </div>
                                )}
                                {userInfo.social_links?.youtube && (
                                    <div className="info-link flex items-center">
                                        <i className="fa-brands fa-youtube" style={{color: '#123e23'}}></i>    
                                        <a href={userInfo.social_links.youtube} target="_blank" rel="noopener noreferrer" className="ml-2 text-[#123E23] hover:underline text-sm sm:text-base">
                                            Youtube
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="info-2 flex items-center justify-center m-0 w-full">
                    <p className="info-bio px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-[30px] text-xs sm:text-sm lg:text-[14px] font-medium text-center sm:text-start leading-relaxed">
                        {userInfo.bio || 'No bio available'}
                    </p>
                </div>
            </div>
        </div>
    );
}