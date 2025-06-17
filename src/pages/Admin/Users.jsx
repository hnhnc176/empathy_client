import SideMenu from "../../components/Admin/SideMenu";
import React, { useState, useEffect } from 'react';
import logo_ad from '../../assets/logo_admin.svg';
import {Eye, Trash2, Filter, BadgeMinus, Badge, BadgeCheck, BadgeAlert, ShieldUser, ShieldX, UserCheck, UserMinus } from "lucide-react";
import styles from "../../style";
import axiosInstance from '../../config/axios';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/toast.jsx';

export default function Users() {
    const [selectedIds, setSelectedIds] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [usersPerPage] = useState(10);
    const [selectAll, setSelectAll] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch users from backend
    useEffect(() => {
        fetchUsers();
    }, [currentPage]);

    // Update selectAll state when selectedIds changes
    useEffect(() => {
        setSelectAll(selectedIds.length === users.length && users.length > 0);
    }, [selectedIds, users]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/users', {
                params: {
                    page: currentPage,
                    limit: usersPerPage
                }
            });

            if (response.data) {
                // Handle both array response and paginated response
                const usersData = Array.isArray(response.data) ? response.data : response.data.data || [];
                setUsers(usersData);
                setTotalUsers(response.data.total || usersData.length);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
            showErrorToast('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedIds([]);
        } else {
            setSelectedIds(users.map(user => user._id));
        }
        setSelectAll(!selectAll);
    };

    const handleToggleUserStatus = async (userId, field) => {
        try {
            const user = users.find(u => u._id === userId);
            const updatedField = field === 'admin' ? 'role' : 'is_active';
            const newValue = field === 'admin' 
                ? (user.role === 'admin' ? 'user' : 'admin')
                : !user.is_active;

            await axiosInstance.put(`/api/users/${userId}`, {
                [updatedField]: newValue
            });

            // Update local state
            setUsers(prevUsers =>
                prevUsers.map(u =>
                    u._id === userId
                        ? { ...u, [updatedField]: newValue }
                        : u
                )
            );

            showSuccessToast(`User ${field} status updated successfully`);
        } catch (error) {
            console.error(`Error updating user ${field}:`, error);
            showErrorToast(`Failed to update user ${field} status`);
        }
    };

    const handleViewUser = (userId) => {
        showInfoToast('View user details feature coming soon');
        // Navigate to user detail page
        // navigate(`/admin/users/${userId}`);
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await axiosInstance.delete(`/api/users/${userId}`);
                setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
                setSelectedIds(prevIds => prevIds.filter(id => id !== userId));
                showSuccessToast('User deleted successfully');
            } catch (error) {
                console.error('Error deleting user:', error);
                showErrorToast('Failed to delete user');
            }
        }
    };

    // Bulk delete functionality
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            showErrorToast('Please select users to delete');
            return;
        }

        const selectedUsernames = users
            .filter(user => selectedIds.includes(user._id))
            .map(user => user.username)
            .join(', ');

        if (window.confirm(
            `Are you sure you want to delete ${selectedIds.length} user(s)?\n\nUsers to be deleted:\n${selectedUsernames}\n\nThis action cannot be undone.`
        )) {
            setIsDeleting(true);
            try {
                // Delete users in parallel
                const deletePromises = selectedIds.map(userId => 
                    axiosInstance.delete(`/api/users/${userId}`)
                );

                const results = await Promise.allSettled(deletePromises);
                
                // Check for any failures
                const failures = results.filter(result => result.status === 'rejected');
                const successes = results.filter(result => result.status === 'fulfilled');

                if (failures.length > 0) {
                    console.error('Some deletions failed:', failures);
                    showErrorToast(`${failures.length} out of ${selectedIds.length} deletions failed`);
                } else {
                    showSuccessToast(`${successes.length} users deleted successfully`);
                }

                // Remove successfully deleted users from the list
                const successfullyDeletedIds = selectedIds.slice(0, successes.length);
                setUsers(prevUsers => 
                    prevUsers.filter(user => !successfullyDeletedIds.includes(user._id))
                );
                setSelectedIds([]);
                setSelectAll(false);

                // Refresh the data to ensure consistency
                await fetchUsers();

            } catch (error) {
                console.error('Error during bulk delete:', error);
                showErrorToast('Failed to delete selected users');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    // Bulk toggle admin status
    const handleBulkToggleAdmin = async (makeAdmin = true) => {
        if (selectedIds.length === 0) {
            showErrorToast('Please select users to update');
            return;
        }

        const action = makeAdmin ? 'admin' : 'user';
        if (window.confirm(`Are you sure you want to make ${selectedIds.length} user(s) ${action}?`)) {
            try {
                const updatePromises = selectedIds.map(userId => 
                    axiosInstance.put(`/api/users/${userId}`, { role: action })
                );

                await Promise.all(updatePromises);

                // Update local state
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        selectedIds.includes(user._id)
                            ? { ...user, role: action }
                            : user
                    )
                );

                setSelectedIds([]);
                setSelectAll(false);
                showSuccessToast(`${selectedIds.length} users updated to ${action} successfully`);
            } catch (error) {
                console.error('Error updating users:', error);
                showErrorToast('Failed to update selected users');
            }
        }
    };

    // Bulk toggle active status
    const handleBulkToggleActive = async (activate = true) => {
        if (selectedIds.length === 0) {
            showErrorToast('Please select users to update');
            return;
        }

        const action = activate ? 'activate' : 'deactivate';
        if (window.confirm(`Are you sure you want to ${action} ${selectedIds.length} user(s)?`)) {
            try {
                const updatePromises = selectedIds.map(userId => 
                    axiosInstance.put(`/api/users/${userId}`, { is_active: activate })
                );

                await Promise.all(updatePromises);

                // Update local state
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        selectedIds.includes(user._id)
                            ? { ...user, is_active: activate }
                            : user
                    )
                );

                setSelectedIds([]);
                setSelectAll(false);
                showSuccessToast(`${selectedIds.length} users ${action}d successfully`);
            } catch (error) {
                console.error('Error updating users:', error);
                showErrorToast('Failed to update selected users');
            }
        }
    };

    const totalPages = Math.ceil(totalUsers / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage + 1;
    const endIndex = Math.min(currentPage * usersPerPage, totalUsers);

    if (loading) {
        return (
            <div className="flex flex-col lg:flex-row w-full h-screen">
                <SideMenu />
                <div className="body_contain flex-1 p-4 lg:p-8 bg-[#FCFCF4] flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-xl lg:text-2xl text-[#123E23] mb-4">Loading users...</div>
                        <i className="fa-solid fa-spinner fa-spin text-2xl lg:text-3xl text-[#123E23]"></i>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col lg:flex-row w-full h-screen">
                <SideMenu />
                <div className="body_contain flex-1 p-4 lg:p-8 bg-[#FCFCF4] flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-xl lg:text-2xl text-red-500 mb-4">{error}</div>
                        <button 
                            onClick={fetchUsers}
                            className="px-4 py-2 bg-[#123E23] text-white rounded-lg hover:bg-[#123E23]/80"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row w-full h-screen">
            <SideMenu />
            <div className="body_contain flex-1 p-4 lg:p-8 bg-[#FCFCF4] overflow-x-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 lg:mb-6 gap-4 sm:gap-0">
                    <h1 className="text-2xl lg:text-3xl font-bold text-[#123E23]">Users ({totalUsers})</h1>
                    <button className="admin-icon p-2 hover:bg-[#FCFCF4] rounded-lg transition-all duration-200">
                        <img src={logo_ad} className="w-6 h-6 lg:w-8 lg:h-8" alt="Admin" />
                    </button>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-[#123E23]/20">
                    {/* Table Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 lg:p-4 border-b border-[#123E23]/10 gap-4 sm:gap-0">
                        <div className="flex flex-wrap items-center gap-2 lg:gap-4 w-full sm:w-auto">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    className="form-checkbox w-4 h-4 rounded border-[#123E23]/20" 
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                />
                                <span className="text-xs text-[#123E23]/60">Select All</span>
                            </div>
                            
                            {/* Bulk Actions */}
                            {selectedIds.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 lg:gap-2">
                                    <button
                                        onClick={handleBulkDelete}
                                        disabled={isDeleting}
                                        className="px-2 lg:px-3 py-1.5 text-xs lg:text-sm bg-[#FFE9DA] !text-[#7A0E27] flex items-center rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <i className="fa-solid fa-spinner fa-spin mr-1 lg:mr-2"></i>
                                                <span className="hidden sm:inline">Deleting...</span>
                                                <span className="sm:hidden">Del...</span>
                                            </>
                                        ) : (
                                            <>
                                                <BadgeMinus className="w-3 h-3 lg:w-4 lg:h-4 self-center inline-block mr-1 lg:mr-2" color="#7A0E27" />
                                                <span className="hidden sm:inline">({selectedIds.length})</span>
                                                <span className="sm:hidden">{selectedIds.length}</span>
                                            </>
                                        )}
                                    </button>
                                    
                                    <button
                                        onClick={() => handleBulkToggleAdmin(true)}
                                        className="px-2 lg:px-3 py-1.5 text-xs lg:text-sm bg-[#F2FDE2] !text-[#1B6F14] rounded-lg"
                                        title="Make Admin"
                                    >
                                        <ShieldUser className="w-3 h-3 lg:w-4 lg:h-4 inline-block" color="#1B6F14" />
                                    </button>
                                    
                                    <button
                                        onClick={() => handleBulkToggleAdmin(false)}
                                        className="px-2 lg:px-3 py-1.5 text-xs lg:text-sm bg-[#FFFCDA] !text-[#FCFCF4] rounded-lg"
                                        title="Remove Admin"
                                    >
                                        <ShieldX className="w-3 h-3 lg:w-4 lg:h-4 inline-block" color="#7A670E" />
                                    </button>
                                    
                                    <button
                                        onClick={() => handleBulkToggleActive(true)}
                                        className="px-2 lg:px-3 py-1.5 text-xs lg:text-sm bg-[#D5F4FF] !text-[#309EFF] rounded-lg"
                                        title="Activate Users"
                                    >
                                        <UserCheck className="w-3 h-3 lg:w-4 lg:h-4 inline-block" color="#092D7A" />
                                    </button>
                                    
                                    <button
                                        onClick={() => handleBulkToggleActive(false)}
                                        className="px-2 lg:px-3 py-1.5 text-xs lg:text-sm bg-[#FFEFCD] !text-[#FF7D05] rounded-lg"
                                        title="Deactivate Users"
                                    >
                                        <UserMinus className="w-3 h-3 lg:w-4 lg:h-4 inline-block" color="#7A3B00" />
                                    </button>
                                </div>
                            )}
                            
                            <button className="px-2 lg:px-3 py-1.5 text-xs lg:text-sm bg-[#DDF4A6] text-[#123E23] rounded-lg hover:bg-[#DDF4A6]/70 transition-colors">
                                <Filter className="w-3 h-3 lg:w-3.5 lg:h-3.5 inline-block mr-1 lg:mr-2" />
                                <span className="hidden sm:inline">Filter</span>
                            </button>
                        </div>
                        <div className="text-xs lg:text-sm text-[#123E23]/60 w-full sm:w-auto text-left sm:text-right">
                            {selectedIds.length} selected
                        </div>
                    </div>

                    {/* Bulk Action Confirmation Bar */}
                    {selectedIds.length > 0 && (
                        <div className="bg-blue-50 border-b border-blue-200 px-3 lg:px-4 py-2">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                                <span className="text-xs lg:text-sm text-blue-800">
                                    <i className="fa-solid fa-info-circle mr-2"></i>
                                    {selectedIds.length} user(s) selected. Choose an action above.
                                </span>
                                <button
                                    onClick={() => {
                                        setSelectedIds([]);
                                        setSelectAll(false);
                                    }}
                                    className="text-xs lg:text-sm text-blue-600 hover:text-blue-800 underline"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mobile Card View */}
                    <div className="lg:hidden">
                        {users.map((user) => (
                            <div 
                                key={user._id} 
                                className={`border-b border-[#123E23]/10 p-4 ${
                                    selectedIds.includes(user._id) ? 'bg-blue-50' : ''
                                }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox w-4 h-4 rounded border-[#123E23]/20"
                                            checked={selectedIds.includes(user._id)}
                                            onChange={() => toggleSelect(user._id)}
                                        />
                                        <div>
                                            <div className="font-medium text-[#123E23]">{user.username}</div>
                                            <div className="text-sm text-[#123E23]/60">#{user._id.slice(-6)}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            className="p-1 hover:bg-[#FCFCF4] rounded-lg transition-colors"
                                            onClick={() => handleViewUser(user._id)}
                                        >
                                            <Eye className="w-4 h-4 text-[#123E23]" />
                                        </button>
                                        <button 
                                            className="p-1 hover:bg-[#FCFCF4] rounded-lg transition-colors"
                                            onClick={() => handleDeleteUser(user._id)}
                                        >
                                            <Trash2 className="w-4 h-4 text-[#123E23]" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="text-sm text-[#123E23] mb-3 break-all">{user.email}</div>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-[#123E23]/60">Admin:</span>
                                            {user.role === 'admin' ? (
                                                <BadgeCheck 
                                                    className="w-4 h-4 cursor-pointer" 
                                                    color="#22C55E"
                                                    stroke="#22C55E"
                                                    onClick={() => handleToggleUserStatus(user._id, 'admin')}
                                                />
                                            ) : (
                                                <Badge 
                                                    className="w-4 h-4 cursor-pointer" 
                                                    color="#EF4444"
                                                    onClick={() => handleToggleUserStatus(user._id, 'admin')}
                                                />
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-[#123E23]/60">Active:</span>
                                            {user.is_active ? (
                                                <BadgeCheck 
                                                    className="w-4 h-4 cursor-pointer" 
                                                    color="#22C55E"
                                                    stroke="#22C55E"
                                                    onClick={() => handleToggleUserStatus(user._id, 'active')}
                                                />
                                            ) : (
                                                <Badge
                                                    className="w-4 h-4 cursor-pointer"
                                                    color="#EF4444"
                                                    onClick={() => handleToggleUserStatus(user._id, 'active')}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table - Your Exact Original Design */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#F0F4E6] text-[#123E23]/70">
                                <tr>
                                    <th className="flex items-start px-4 py-3 font-medium">
                                        <input 
                                            type="checkbox" 
                                            className="form-checkbox w-4 h-4 rounded border-[#123E23]/20" 
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="px-4 py-3 font-medium text-left">ID</th>
                                    <th className="px-4 py-3 font-medium text-left">USERNAME</th>
                                    <th className="px-4 py-3 font-medium text-left">EMAIL</th>
                                    <th className="px-4 py-3 font-medium text-center">ADMIN</th>
                                    <th className="px-4 py-3 font-medium text-center">ACTIVE</th>
                                    <th className="px-4 py-3 font-medium text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#123E23]/10">
                                {users.map((user) => (
                                    <tr 
                                        key={user._id} 
                                        className={`hover:bg-[#F0F4E6]/50 transition-colors ${
                                            selectedIds.includes(user._id) ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox w-4 h-4 rounded border-[#123E23]/20"
                                                checked={selectedIds.includes(user._id)}
                                                onChange={() => toggleSelect(user._id)}
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-medium text-[#123E23]">
                                            #{user._id.slice(-6)}
                                        </td>
                                        <td className="px-4 py-3 text-[#123E23]">
                                            {user.username}
                                        </td>
                                        <td className="px-4 py-3 text-[#123E23]">
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {user.role === 'admin' ? (
                                                <BadgeCheck 
                                                    className="w-5 h-5 inline-block cursor-pointer" 
                                                    color="#22C55E"
                                                    stroke="#22C55E"
                                                    onClick={() => handleToggleUserStatus(user._id, 'admin')}
                                                />
                                            ) : (
                                                <Badge 
                                                    className="w-5 h-5 inline-block cursor-pointer" 
                                                    color="#EF4444"
                                                    onClick={() => handleToggleUserStatus(user._id, 'admin')}
                                                />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {user.is_active ? (
                                                <BadgeCheck 
                                                    className="w-5 h-5 inline-block cursor-pointer" 
                                                    color="#22C55E"
                                                    stroke="#22C55E"
                                                    onClick={() => handleToggleUserStatus(user._id, 'active')}
                                                />
                                            ) : (
                                                <Badge
                                                    className="w-5 h-5 inline-block cursor-pointer"
                                                    color="#EF4444"
                                                    onClick={() => handleToggleUserStatus(user._id, 'active')}
                                                />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center space-x-3">
                                                <button 
                                                    className="p-1 hover:bg-[#FCFCF4] rounded-lg transition-colors cursor-pointer"
                                                    onClick={() => handleViewUser(user._id)}
                                                >
                                                    <Eye className="w-5 h-5 text-[#123E23]" />
                                                </button>
                                                <button 
                                                    className="p-1 hover:bg-[#FCFCF4] rounded-lg transition-colors cursor-pointer"
                                                    onClick={() => handleDeleteUser(user._id)}
                                                >
                                                    <Trash2 className="w-5 h-5 text-[#123E23]" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between px-3 lg:px-4 py-3 border-t border-[#123E23]/10 gap-4 sm:gap-0">
                        <button 
                            className="text-sm font-medium text-[#123E23] hover:bg-[#FCFCF4] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="text-sm text-[#123E23]/60">
                            {startIndex}–{endIndex} of {totalUsers}
                        </span>
                        <button 
                            className="text-sm font-medium text-[#123E23] hover:bg-[#FCFCF4] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}