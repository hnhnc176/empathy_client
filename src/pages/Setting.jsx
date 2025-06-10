import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import { showSuccessToast, showErrorToast, showInfoToast } from '../utils/toast.jsx';
import Search from '../components/SearchBar';
import Pic from '../components/ProfilePic';
import axiosInstance from '../config/axios';

export default function Setting() {
    const { user } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        email: '',
        phone_number: '',
        bio: '',
        social_links: {
            website: '',
            facebook: '',
            instagram: '',
            linkedin: '',
            twitter: '',
            github: '',
            youtube: ''
        }
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [notifications, setNotifications] = useState({
        likes: true,
        comments: true,
        mentions: true,
        system: true
    });

    // Fetch user settings on component mount
    useEffect(() => {
        const fetchUserSettings = async () => {
            try {
                const [userResponse, settingsResponse] = await Promise.all([
                    axiosInstance.get(`/api/users/${user._id}`),
                    axiosInstance.get(`/api/settings/${user._id}`)
                ]);

                // Normalize social links by ensuring all fields exist
                const defaultSocialLinks = {
                    website: '',
                    facebook: '',
                    instagram: '',
                    linkedin: '',
                    twitter: '',
                    github: '',
                    youtube: ''
                };

                const socialLinks = settingsResponse.data.data.social_links || {};

                // Update form data with user info and normalized social links
                setFormData({
                    username: userResponse.data.username || '',
                    full_name: userResponse.data.full_name || '',
                    email: userResponse.data.email || '',
                    phone_number: userResponse.data.phone_number || '',
                    bio: userResponse.data.bio || '',
                    social_links: { ...defaultSocialLinks, ...socialLinks }
                });

                // Update notifications with boolean values
                const preferences = settingsResponse.data.data.notification_preferences || {};
                setNotifications({
                    likes: Boolean(preferences.likes ?? true),
                    comments: Boolean(preferences.comments ?? true),
                    mentions: Boolean(preferences.mentions ?? true),
                    system: Boolean(preferences.system ?? true)
                });
            } catch (error) {
                console.error('Error fetching user settings:', error);
                showErrorToast('Failed to load user settings');
            }
        };

        if (user?._id) {
            fetchUserSettings();
        }
    }, [user?._id]);

    // Handle profile update
    const handleProfileUpdate = async () => {
        try {
            // Filter out empty social links
            const filteredSocialLinks = Object.entries(formData.social_links).reduce((acc, [key, value]) => {
                if (value && value.trim()) {
                    // Add proper URL format if missing
                    let formattedValue = value.trim();
                    if (key !== 'website') {
                        switch (key) {
                            case 'facebook':
                                if (!formattedValue.startsWith('https://facebook.com/')) {
                                    formattedValue = `https://facebook.com/${formattedValue.replace('@', '')}`;
                                }
                                break;
                            case 'twitter':
                                if (!formattedValue.startsWith('https://twitter.com/')) {
                                    formattedValue = `https://twitter.com/${formattedValue.replace('@', '')}`;
                                }
                                break;
                            case 'instagram':
                                if (!formattedValue.startsWith('https://instagram.com/')) {
                                    formattedValue = `https://instagram.com/${formattedValue.replace('@', '')}`;
                                }
                                break;
                            case 'linkedin':
                                if (!formattedValue.startsWith('https://linkedin.com/in/')) {
                                    formattedValue = `https://linkedin.com/in/${formattedValue.replace('@', '')}`;
                                }
                                break;
                            case 'github':
                                if (!formattedValue.startsWith('https://github.com/')) {
                                    formattedValue = `https://github.com/${formattedValue.replace('@', '')}`;
                                }
                                break;
                            case 'youtube':
                                if (!formattedValue.startsWith('https://youtube.com/')) {
                                    formattedValue = `https://youtube.com/${formattedValue.replace('@', '')}`;
                                }
                                break;
                        }
                    }
                    acc[key] = formattedValue;
                }
                return acc;
            }, {});

            // Update user profile
            await axiosInstance.put(`/api/users/${user._id}`, {
                username: formData.username,
                full_name: formData.full_name,
                email: formData.email,
                phone_number: formData.phone_number,
                bio: formData.bio
            });

            // Update social links
            await axiosInstance.put(`/api/settings/${user._id}`, {
                social_links: filteredSocialLinks
            });

            showSuccessToast('Profile updated successfully');
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'Failed to update profile');
        }
    };

    // Handle password change
    const handlePasswordChange = async () => {
        if (passwordData.new_password !== passwordData.confirm_password) {
            showErrorToast('New passwords do not match');
            return;
        }

        try {
            await axiosInstance.post(`/api/users/${user._id}/change-password`, {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });

            showSuccessToast('Password changed successfully');
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'Failed to change password');
        }
    };

    // Handle notification preferences update
    const handleNotificationUpdate = async () => {
        try {
            // Convert checkbox values to boolean
            const notificationPreferences = {
                likes: Boolean(notifications.likes),
                comments: Boolean(notifications.comments),
                mentions: Boolean(notifications.mentions),
                system: Boolean(notifications.system)
            };

            await axiosInstance.put(`/api/settings/${user._id}`, {
                notification_preferences: notificationPreferences
            });

            showSuccessToast('Notification preferences updated');
        } catch (error) {
            showErrorToast('Failed to update notification preferences');
        }
    };

    // Handle account deactivation
    const handleDeactivateAccount = async () => {
        if (window.confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
            try {
                await axiosInstance.delete(`/api/users/${user._id}`);
                showSuccessToast('Account deactivated successfully');
                // Redirect to logout/home
                window.location.href = '/';
            } catch (error) {
                console.error('Error deactivating account:', error);
                showErrorToast('Failed to deactivate account');
            }
        }
    };

    const inputStyle = {
        borderRadius: '5px',
        fontSize: '16px',
        height: '48px',
        border: '1px solid #123E23',
        fontWeight: '400',
        backgroundColor: '#FFFFFF',
        width: '550px',
        outline: 'none',
        padding: '0 10px'
    };

    const socialInputContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        borderRadius: '5px',
        border: '1px solid #123E23',
        backgroundColor: '#FFFFFF',
        height: '48px',
        width: '100%',
    };

    const socialIconContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '1px solid #123E23',
        padding: '0 20px',
        height: '70%'
    };

    const socialInputStyle = {
        width: '100%',
        height: '100%',
        border: 'none',
        outline: 'none',
        padding: '0 16px',
        fontSize: '16px',
        backgroundColor: 'transparent',
        fontWeight: '500'
    };

    const labelStyle = {
        fontSize: '16px',
        fontWeight: '500',
        color: '#123E23',
        with: '100%'
    }

    return (
        <main className="body-content bg-[#FCFCF4] flex flex-col self-center p-[80px] gap-[80px] justify-between">
            <div className="heading flex px-[0] py-[32px] flex-row items-center gap-[5px] justify-between border-[#CBD5E1] border-[0_0_1px_0]">
                <div className="title flex px-[0] py-[12px] self-center flex-row items-center gap-[5px] text-[30px] font-bold justify-between w-full">Setting</div>
                <Search />
            </div>
            <div className="basic-info flex flex-row gap-[32px] justify-between py-[30px]">
                <Pic />
                <div className="profile-info flex flex-col gap-[32px] w-3/5 justify-between">
                    <div className="profile-info-title font-bold text-2xl border-[#CBD5E1] border-[0_0_1px_0]">
                        <div className="title">Basic profile</div>
                        <p className="sub-title !text-[16px] mb-3.5 mt-1">Please update your profile settings here</p>
                    </div>
                    <div className="profile-item flex flex-col gap-[40px] w-full justify-between">
                        <div className="input-profile flex flex-row gap-[160px] justify-between w-full">
                            <label style={labelStyle} htmlFor="username">Username</label>
                            <input
                                style={inputStyle}
                                type="text"
                                id="username"
                                className="w-full"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div className="input-profile flex flex-row gap-[160px] justify-between w-full">
                            <label style={labelStyle} htmlFor="fullname">Full Name</label>
                            <input
                                style={inputStyle}
                                type="text"
                                id="fullname"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>
                        <div className="input-profile flex flex-row gap-[160px] justify-between w-full">
                            <label style={labelStyle} htmlFor="email">Email</label>
                            <input
                                style={inputStyle}
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="input-profile flex flex-row gap-[160px] justify-between w-full">
                            <label style={labelStyle} htmlFor="phone">Phone Number</label>
                            <input
                                style={inputStyle}
                                type="tel"
                                id="phone"
                                value={formData.phone_number}
                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                            />
                        </div>
                        <div className="input-profile flex flex-row gap-[160px] justify-between w-full">
                            <label style={labelStyle} htmlFor="bio">Biography</label>
                            <textarea
                                style={inputStyle}
                                id="bio"
                                rows="4"
                                className="!h-[150px] !py-2.5"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            ></textarea>
                        </div>
                    </div>
                    <div className="yesno-btn">
                        <button className="btnY" onClick={() => setFormData({
                            username: '',
                            full_name: '',
                            email: '',
                            phone_number: '',
                            bio: '',
                            social_links: {
                                website: '',
                                facebook: '',
                                instagram: '',
                                linkedin: '',
                                twitter: '',
                                github: '',
                                youtube: ''
                            }
                        })}>Cancle <i className="fa-solid fa-xmark" style={{ color: '#808080' }}></i></button>
                        <button className="btnN" onClick={handleProfileUpdate}>Save <i className="fa-solid fa-check fa-sm" style={{ color: '#f0f4e6' }}></i></button>
                    </div>
                </div>
            </div>
            <div className="social-life">
                <div className="noti-title flex px-[0] py-[12px] self-center flex-row items-center gap-[5px] text-[30px] font-bold justify-between w-full border-[#CBD5E1] border-[0_0_1px_0]">
                    Social Profile
                </div>
                <div className="social-item mx-[0] my-[40px] space-y-6">
                    {/* Personal Website Input */}
                    <div className="website-container">
                        <label style={labelStyle} htmlFor="website" className="block mb-2">
                            Personal Website
                        </label>
                        <div style={socialInputContainerStyle}>
                            <div style={socialIconContainerStyle}>
                                <i className="fa-solid fa-paperclip" style={{ color: '#123e23' }}></i>
                            </div>
                            <input
                                style={socialInputStyle}
                                type="text"
                                id="website"
                                placeholder="Personal website or portfolio url..."
                                value={formData.social_links.website}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    social_links: { ...formData.social_links, website: e.target.value }
                                })}
                            />
                        </div>
                    </div>

                    {/* Social Media Grid */}
                    <div className="grid grid-cols-3 gap-6">
                        {/* Facebook */}
                        <div className="social-input-container">
                            <label style={labelStyle} htmlFor="facebook" className="block mb-2">
                                Facebook
                            </label>
                            <div style={socialInputContainerStyle}>
                                <div style={socialIconContainerStyle}>
                                    <i className="fa-brands fa-facebook-f" style={{ color: '#123e23' }}></i>
                                </div>
                                <input
                                    style={socialInputStyle}
                                    type="text"
                                    id="facebook"
                                    placeholder="Username"
                                    value={formData.social_links.facebook}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        social_links: { ...formData.social_links, facebook: e.target.value }
                                    })}
                                />
                            </div>
                        </div>

                        {/* Instagram */}
                        <div className="social-input-container">
                            <label style={labelStyle} htmlFor="instagram" className="block mb-2">
                                Instagram
                            </label>
                            <div style={socialInputContainerStyle}>
                                <div style={socialIconContainerStyle}>
                                    <i className="fa-brands fa-instagram" style={{ color: '#123e23' }}></i>
                                </div>
                                <input
                                    style={socialInputStyle}
                                    type="text"
                                    id="instagram"
                                    placeholder="Username"
                                    value={formData.social_links.instagram}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        social_links: { ...formData.social_links, instagram: e.target.value }
                                    })}
                                />
                            </div>
                        </div>

                        {/* LinkedIn */}
                        <div className="social-input-container">
                            <label style={labelStyle} htmlFor="linkedin" className="block mb-2">
                                LinkedIn
                            </label>
                            <div style={socialInputContainerStyle}>
                                <div style={socialIconContainerStyle}>
                                    <i className="fa-brands fa-linkedin-in" style={{ color: '#123e23' }}></i>
                                </div>
                                <input
                                    style={socialInputStyle}
                                    type="text"
                                    id="linkedin"
                                    placeholder="Username"
                                    value={formData.social_links.linkedin}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        social_links: { ...formData.social_links, linkedin: e.target.value }
                                    })}
                                />
                            </div>
                        </div>

                        {/* Twitter/X */}
                        <div className="social-input-container">
                            <label style={labelStyle} htmlFor="twitter" className="block mb-2">
                                X
                            </label>
                            <div style={socialInputContainerStyle}>
                                <div style={socialIconContainerStyle}>
                                    <i className="fa-brands fa-x-twitter" style={{ color: '#123e23' }}></i>
                                </div>
                                <input
                                    style={socialInputStyle}
                                    type="text"
                                    id="twitter"
                                    placeholder="Username"
                                    value={formData.social_links.twitter}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        social_links: { ...formData.social_links, twitter: e.target.value }
                                    })}
                                />
                            </div>
                        </div>

                        {/* Github */}
                        <div className="social-input-container">
                            <label style={labelStyle} htmlFor="github" className="block mb-2">
                                Github
                            </label>
                            <div style={socialInputContainerStyle}>
                                <div style={socialIconContainerStyle}>
                                    <i className="fa-brands fa-github" style={{ color: '#123e23' }}></i>
                                </div>
                                <input
                                    style={socialInputStyle}
                                    type="text"
                                    id="github"
                                    placeholder="Username"
                                    value={formData.social_links.github}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        social_links: { ...formData.social_links, github: e.target.value }
                                    })}
                                />
                            </div>
                        </div>

                        {/* Youtube */}
                        <div className="social-input-container">
                            <label style={labelStyle} htmlFor="youtube" className="block mb-2">
                                Youtube
                            </label>
                            <div style={socialInputContainerStyle}>
                                <div style={socialIconContainerStyle}>
                                    <i className="fa-brands fa-youtube" style={{ color: '#123e23' }}></i>
                                </div>
                                <input
                                    style={socialInputStyle}
                                    type="text"
                                    id="youtube"
                                    placeholder="Username"
                                    value={formData.social_links.youtube}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        social_links: { ...formData.social_links, youtube: e.target.value }
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="yesno-btn flex justify-end gap-[20px] text-[20px] border-[#CBD5E1] border-[1px_0_0_0] pt-[20px]">
                    <button className="btnY px-[20px] py-[10px] bg-[#F0F4E6] text-[#123E23] border-[none] rounded-[120px] cursor-pointer" onClick={() => setFormData({
                        username: '',
                        full_name: '',
                        email: '',
                        phone_number: '',
                        bio: '',
                        social_links: {
                            website: '',
                            facebook: '',
                            instagram: '',
                            linkedin: '',
                            twitter: '',
                            github: '',
                            youtube: ''
                        }
                    })}>Cancle <i className="fa-solid fa-xmark" style={{ color: '#808080' }}></i></button>
                    <button className="btnN px-[20px] py-[10px] bg-[#123E23] text-[#F0F4E6] border-[none] rounded-[120px] cursor-pointer" onClick={handleProfileUpdate}>Save <i className="fa-solid fa-check fa-sm" style={{ color: '#f0f4e6' }}></i></button>
                </div>
            </div>
            <div className="noti-pw flex flex-row gap-[80px] justify-between pt-[30px]">
                {/* Notification Section */}
                <div className="notification flex flex-col gap-[24px] w-2/5">
                    <div className="noti-title border-b border-[#CBD5E1] pb-4">
                        <div className="text-[2rem] font-bold text-[#123E23]">Notification</div>
                        <p className="!text-[14px] text-[#123E23]/70 mt-2">Choose what notifications you want to receive</p>
                    </div>

                    <div className="notification-list flex flex-col gap-[36px]">
                        <div className="notification-item flex items-center gap-[12px] group">
                            <input
                                className="check-noti w-5 h-5 accent-[#123E23] cursor-pointer"
                                type="checkbox"
                                id="email-notification"
                                checked={notifications.likes}
                                onChange={() => setNotifications({ ...notifications, likes: !notifications.likes })}
                            />
                            <label
                                className="flex flex-col cursor-pointer"
                                htmlFor="email-notification"
                            >
                                <span className="text-[16px] font-medium text-[#123E23]">News & Announcements</span>
                                <span className="text-[14px] text-[#123E23]/70">Get notified about latest news and updates</span>
                            </label>
                        </div>

                        <div className="notification-item flex items-center gap-[12px] group">
                            <input
                                className="check-noti w-5 h-5 accent-[#123E23] cursor-pointer"
                                type="checkbox"
                                id="thread-updates"
                                checked={notifications.comments}
                                onChange={() => setNotifications({ ...notifications, comments: !notifications.comments })}
                            />
                            <label
                                className="flex flex-col cursor-pointer"
                                htmlFor="thread-updates"
                            >
                                <span className="text-[16px] font-medium text-[#123E23]">Thread Updates</span>
                                <span className="text-[14px] text-[#123E23]/70">Receive updates on threads you follow</span>
                            </label>
                        </div>

                        <div className="notification-item flex items-center gap-[12px] group">
                            <input
                                className="check-noti w-5 h-5 accent-[#123E23] cursor-pointer"
                                type="checkbox"
                                id="interactions"
                                checked={notifications.mentions}
                                onChange={() => setNotifications({ ...notifications, mentions: !notifications.mentions })}
                            />
                            <label
                                className="flex flex-col cursor-pointer"
                                htmlFor="interactions"
                            >
                                <span className="text-[16px] font-medium text-[#123E23]">Comment & Reply Alerts</span>
                                <span className="text-[14px] text-[#123E23]/70">Get notified when someone interacts with your posts</span>
                            </label>
                        </div>

                        <div className="notification-item flex items-center gap-[12px] group">
                            <input
                                className="check-noti w-5 h-5 accent-[#123E23] cursor-pointer"
                                type="checkbox"
                                id="system-updates"
                                checked={notifications.system}
                                onChange={() => setNotifications({ ...notifications, system: !notifications.system })}
                            />
                            <label
                                className="flex flex-col cursor-pointer"
                                htmlFor="system-updates"
                            >
                                <span className="text-[16px] font-medium text-[#123E23]">Account & System Updates</span>
                                <span className="text-[14px] text-[#123E23]/70">Important updates about your account and system</span>
                            </label>
                        </div>

                        <div className="yesno-btn flex justify-end gap-[20px]">
                            <button className="btnY px-[20px] py-[10px] bg-[#F0F4E6] text-[#123E23] border-[none] rounded-[120px] cursor-pointer" onClick={() => setNotifications({
                                likes: true,
                                comments: true,
                                mentions: true,
                                system: true
                            })}>
                                <i className="fa-solid fa-xmark" style={{ color: '#808080' }}></i>
                            </button>
                            <button className="btnN px-[20px] py-[10px] bg-[#123E23] text-[#F0F4E6] border-[none] rounded-[120px] cursor-pointer" onClick={handleNotificationUpdate}>
                                <i className="fa-solid fa-check fa-sm" style={{ color: '#f0f4e6' }}></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Change Password Section */}
                <div className="change-pw flex flex-col gap-[24px] w-2/5">
                    <div className="title border-b border-[#CBD5E1] pb-4">
                        <div className="text-[2rem] font-bold text-[#123E23]">Change Password</div>
                        <p className="!text-[14px] text-[#123E23]/70 mt-2">Ensure your account is secure with a strong password</p>
                    </div>
                    <div className="change-pw-form flex flex-col gap-[24px]">
                        <div className="input-group flex flex-col gap-[12px]">
                            <label style={labelStyle} htmlFor="old-password">Current Password</label>
                            <input
                                style={inputStyle}
                                className="!w-full"
                                type="password"
                                id="old-password"
                                placeholder="Password"
                                value={passwordData.current_password}
                                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                            />
                        </div>

                        <div className="input-group flex flex-col gap-[12px]">
                            <label style={labelStyle} htmlFor="new-password">New Password</label>
                            <input
                                style={inputStyle}
                                className="!w-full"
                                type="password"
                                id="new-password"
                                placeholder="Password"
                                value={passwordData.new_password}
                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                            />
                        </div>

                        <div className="input-group flex flex-col gap-[12px]">
                            <label style={labelStyle} htmlFor="confirm-password">Confirm Password</label>
                            <input
                                style={inputStyle}
                                className="!w-full"
                                type="password"
                                id="confirm-password"
                                placeholder="Confirm new password"
                                value={passwordData.confirm_password}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="yesno-btn flex justify-end gap-[20px]">
                        <button className="btnY px-[20px] py-[10px] bg-[#F0F4E6] text-[#123E23] border-[none] rounded-[120px] cursor-pointer" onClick={() => setPasswordData({
                            current_password: '',
                            new_password: '',
                            confirm_password: ''
                        })}>
                            <i className="fa-solid fa-xmark" style={{ color: '#808080' }}></i>
                        </button>
                        <button className="btnN px-[20px] py-[10px] bg-[#123E23] text-[#F0F4E6] border-[none] rounded-[120px] cursor-pointer" onClick={handlePasswordChange}>
                            <i className="fa-solid fa-check fa-sm" style={{ color: '#f0f4e6' }}></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="deactive-account w-fit bg-[#FF6868] self-end rounded-3xl">
                <button className="btn flex items-center justify-center gap-2.5" style={{ color: '#f0f4e6' }} onClick={handleDeactivateAccount}>Deactive Account <i className="fa-solid fa-xmark" style={{ color: '#f0f4e6' }}></i></button>
            </div>
        </main>
    );
}