import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, User, Search } from 'lucide-react';
import axiosInstance from '../../config/axios';
import avt from '../../assets/avt.png';
import adminLogo from '../../assets/Logo.png';

const UserMultiSelect = ({ selectedUsers, onSelectionChange, placeholder = "Select users to notify..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        // Filter users based on search term
        if (searchTerm.trim()) {
            const filtered = users.filter(user => 
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchTerm, users]);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/users', {
                params: {
                    limit: 1000 // Get a large number to include all users
                }
            });

            let usersData = [];
            if (response.data?.status === 'success') {
                usersData = response.data.data || [];
            } else if (Array.isArray(response.data)) {
                usersData = response.data;
            } else if (response.data?.data) {
                usersData = response.data.data;
            }

            setUsers(usersData);
            setFilteredUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
            setFilteredUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUserToggle = (user) => {
        const isSelected = selectedUsers.some(selected => selected._id === user._id);
        
        if (isSelected) {
            // Remove user from selection
            const newSelection = selectedUsers.filter(selected => selected._id !== user._id);
            onSelectionChange(newSelection);
        } else {
            // Add user to selection
            const newSelection = [...selectedUsers, user];
            onSelectionChange(newSelection);
        }
    };

    const removeUser = (userId) => {
        const newSelection = selectedUsers.filter(selected => selected._id !== userId);
        onSelectionChange(newSelection);
    };

    const selectAllUsers = () => {
        onSelectionChange(filteredUsers);
    };

    const clearAllUsers = () => {
        onSelectionChange([]);
    };

    const isUserSelected = (user) => {
        return selectedUsers.some(selected => selected._id === user._id);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Selected Users Display */}
            <div className="border border-[#123E23] bg-white rounded-lg p-2 min-h-[42px] cursor-pointer" 
                 onClick={() => setIsOpen(!isOpen)}>
                <div className="flex flex-wrap gap-1 items-center">
                    {selectedUsers.length === 0 ? (
                        <span className="text-gray-500 text-sm">{placeholder}</span>
                    ) : (
                        selectedUsers.map(user => (
                            <div key={user._id} 
                                 className="flex items-center gap-1 bg-[#F0F4E6] text-[#123E23] px-2 py-1 rounded text-xs">
                                <img 
                                    src={user.role === 'admin' ? adminLogo : avt} 
                                    alt={user.role === 'admin' ? 'Admin Avatar' : 'User Avatar'} 
                                    className="w-3 h-3 rounded-full object-cover" 
                                />
                                <span>{user.username}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeUser(user._id);
                                    }}
                                    className="text-[#123E23] hover:text-red-600 ml-1"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))
                    )}
                    <div className="ml-auto">
                        <ChevronDown className={`w-4 h-4 text-[#123E23] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border border-[#123E23] rounded-lg mt-1 shadow-lg z-10 max-h-80 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-[#123E23]/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#123E23]"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between p-2 border-b border-[#123E23]/10">
                        <button
                            onClick={selectAllUsers}
                            className="text-xs px-3 py-1 bg-[#123E23] !text-white rounded hover:bg-[#123E23]/80"
                            disabled={filteredUsers.length === 0}
                        >
                            Select All ({filteredUsers.length})
                        </button>
                        <button
                            onClick={clearAllUsers}
                            className="text-xs px-3 py-1 border border-[#123E23] text-[#123E23] rounded hover:bg-[#F0F4E6]"
                            disabled={selectedUsers.length === 0}
                        >
                            Clear All
                        </button>
                    </div>

                    {/* Users List */}
                    <div className="max-h-60 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-[#123E23]">
                                <div className="flex items-center justify-center space-x-2">
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    <span className="text-sm">Loading users...</span>
                                </div>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">
                                    {searchTerm ? 'No users found matching your search' : 'No users available'}
                                </p>
                            </div>
                        ) : (
                            filteredUsers.map(user => {
                                const isSelected = isUserSelected(user);
                                return (
                                    <div
                                        key={user._id}
                                        onClick={() => handleUserToggle(user)}
                                        className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                                            isSelected 
                                                ? 'bg-[#F0F4E6] text-[#123E23]' 
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {}} // Handled by parent onClick
                                            className="form-checkbox w-4 h-4 text-[#123E23] rounded border-gray-300"
                                        />
                                        <img 
                                            src={user.role === 'admin' ? adminLogo : avt} 
                                            alt={user.role === 'admin' ? 'Admin Avatar' : 'User Avatar'} 
                                            className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-[#123E23]">
                                                {user.username}
                                            </div>
                                            <div className="text-xs text-[#123E23]/60 truncate">
                                                {user.email}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs">
                                            <span className={`px-2 py-1 rounded-full ${
                                                user.role === 'admin' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {user.role || 'user'}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full ${
                                                user.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer with selection count */}
                    {selectedUsers.length > 0 && (
                        <div className="p-2 border-t border-[#123E23]/10 bg-[#F0F4E6]/20">
                            <div className="text-xs text-[#123E23] text-center">
                                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserMultiSelect;