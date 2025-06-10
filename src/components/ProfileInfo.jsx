import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ProfilePic from './ProfilePic';
import { Link } from 'react-router-dom';
import axiosInstance from '../config/axios';

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
            youtube: null    // Add YouTube to match your UI
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

                // Fetch both user data and settings
                const [userResponse, settingsResponse] = await Promise.all([
                    axiosInstance.get(`/api/users/${userId}`),
                    axiosInstance.get(`/api/settings/${userId}`)
                ]);

                // Set the userInfo with social links from settings
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
            <div className="cover-info w-full h-[450px] bg-[#F0F4E6] flex items-center justify-center rounded-[6px]">
                <div className="info w-[90%] h-[350px] flex items-center justify-center bg-[#fff] mx-[30px] my-[20px] rounded-[6px]">
                    <div className="text-[#123E23] text-lg">Loading user information...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cover-info w-full h-[450px] bg-[#F0F4E6] flex items-center justify-center rounded-[6px]">
                <div className="info w-[90%] h-[350px] flex flex-col items-center justify-center bg-[#fff] mx-[30px] my-[20px] rounded-[6px] gap-4">
                    <div className="text-red-500 text-center px-4">{error}</div>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-[#123E23] text-white rounded hover:bg-opacity-80"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cover-info w-full h-[450px] bg-[#F0F4E6] flex items-center justify-center rounded-[6px]">
            <div className="info w-[90%] h-[350px] flex flex-col items-center justify-center bg-[#fff] mx-[30px] my-[20px] rounded-[6px]">
                <div className="info-1 flex items-center justify-evenly mx-[30px] my-[20px] flex-row w-[95%] gap-[44px]">
                    <div className="picture-pic flex w-[145px] h-[130px]">
                        <img className="picture-pic-img w-full h-full" src="src/assets/avt.png" alt="Profile" />
                    </div>
                    <div className="info-profile flex flex-col items-start px-[30px] py-[0] w-full justify-between gap-[30px]">
                        <div className="info-name text-[30px] flex justify-between w-full font-bold text-[#123E23] m-0">
                            @{userInfo.username || 'Username'}
                            <Link to={userInfo.social_links?.website || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                <i className="fa-solid fa-globe fa-xs self-center cursor-pointer" style={{color: '#123e23'}}>
                                    {userInfo.social_links?.website ? ' ' : ''}
                                </i>
                            </Link>
                        </div>
                        <div className="info-links flex flex-col justify-between items-start gap-[20px] w-full">
                            <div className="info-li-col-1">
                                {userInfo.social_links?.facebook && (
                                    <div className="info-link">
                                        <i className="fa-brands fa-facebook-f" style={{color: '#123e23'}}></i> 
                                        <a href={userInfo.social_links.facebook} target="_blank" rel="noopener noreferrer" className="ml-2 text-[#123e23] hover:underline">
                                            Facebook
                                        </a>
                                    </div>
                                )}
                                {userInfo.social_links?.instagram && (
                                    <div className="info-link">
                                        <i className="fa-brands fa-instagram fa-lg" style={{color: '#123e23'}}></i> 
                                        <a href={userInfo.social_links.instagram} target="_blank" rel="noopener noreferrer" className="ml-2 text-[#123e23] hover:underline">
                                            Instagram
                                        </a>
                                    </div>
                                )}
                                {userInfo.social_links?.linkedin && (
                                    <div className="info-link">
                                        <i className="fa-brands fa-linkedin-in" style={{color: '#123e23'}}></i> 
                                        <a href={userInfo.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="ml-2 text-[#123e23] hover:underline">
                                            LinkedIn
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div className="info-li-col-1">
                                {userInfo.social_links?.twitter && (
                                    <div className="info-link">
                                        <i className="fa-brands fa-x-twitter" style={{color: '#123e23'}}></i> 
                                        <a href={userInfo.social_links.twitter} target="_blank" rel="noopener noreferrer" className="ml-2 text-[#123e23] hover:underline">
                                            Twitter
                                        </a>
                                    </div>
                                )}
                                {userInfo.social_links?.github && (
                                    <div className="info-link">
                                        <i className="fa-brands fa-github fa-lg" style={{color: '#123e23'}}></i> 
                                        <a href={userInfo.social_links.github} target="_blank" rel="noopener noreferrer" className="ml-2 text-[#123e23] hover:underline">
                                            GitHub
                                        </a>
                                    </div>
                                )}
                                {userInfo.social_links?.youtube && (
                                    <div className="info-link" >
                                    <i className="fa-brands fa-youtube" style={{color: '#123e23'}}></i>    
                                    <a href={userInfo.social_links.youtube} target="_blank" rel="noopener noreferrer" className="ml-2 text-[#123E23] hover:underline">
                                        Youtube
                                    </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="info-2 flex items-center justify-center m-0">
                    <p className="info-bio px-10 py-[30px] text-[14px] font-medium text-start leading">
                        {userInfo.bio || 'No bio available'}
                    </p>
                </div>
            </div>
        </div>
    );
}