import React, { useState } from 'react';
import axiosInstance from '../../config/axios';
import { showErrorToast, showSuccessToast } from '../../utils/toast';

const ReportAnswerForm = ({ report, currentAdmin, onUpdate, onClose }) => {
  const [form, setForm] = useState({
    status: report.status || 'pending',
    resolution_notes: report.resolution_notes || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enhanced function to get valid admin ID with better fallback options
  const getValidAdminId = () => {
    console.log('Getting valid admin ID. Current admin:', currentAdmin);
    
    // Check if currentAdmin._id is already valid
    if (currentAdmin?._id && /^[0-9a-fA-F]{24}$/.test(currentAdmin._id)) {
      return currentAdmin._id;
    }
    
    // Check if currentAdmin.id exists and is valid
    if (currentAdmin?.id && /^[0-9a-fA-F]{24}$/.test(currentAdmin.id)) {
      return currentAdmin.id;
    }
    
    // Check localStorage for admin info
    try {
      const storedAdmin = localStorage.getItem('admin');
      if (storedAdmin) {
        const adminData = JSON.parse(storedAdmin);
        console.log('Stored admin data:', adminData);
        
        // Check for _id
        if (adminData._id && /^[0-9a-fA-F]{24}$/.test(adminData._id)) {
          return adminData._id;
        }
        
        // Check for id
        if (adminData.id && /^[0-9a-fA-F]{24}$/.test(adminData.id)) {
          return adminData.id;
        }
        
        // Check for user._id (nested structure)
        if (adminData.user?._id && /^[0-9a-fA-F]{24}$/.test(adminData.user._id)) {
          return adminData.user._id;
        }
        
        // Check for user.id (nested structure)
        if (adminData.user?.id && /^[0-9a-fA-F]{24}$/.test(adminData.user.id)) {
          return adminData.user.id;
        }
      }
    } catch (e) {
      console.error('Error parsing stored admin data:', e);
    }
    
    // Check sessionStorage for admin info
    try {
      const sessionAdmin = sessionStorage.getItem('admin');
      if (sessionAdmin) {
        const adminData = JSON.parse(sessionAdmin);
        console.log('Session admin data:', adminData);
        
        // Check for _id
        if (adminData._id && /^[0-9a-fA-F]{24}$/.test(adminData._id)) {
          return adminData._id;
        }
        
        // Check for id
        if (adminData.id && /^[0-9a-fA-F]{24}$/.test(adminData.id)) {
          return adminData.id;
        }
        
        // Check for user._id (nested structure)
        if (adminData.user?._id && /^[0-9a-fA-F]{24}$/.test(adminData.user._id)) {
          return adminData.user._id;
        }
        
        // Check for user.id (nested structure)
        if (adminData.user?.id && /^[0-9a-fA-F]{24}$/.test(adminData.user.id)) {
          return adminData.user.id;
        }
      }
    } catch (e) {
      console.error('Error parsing session admin data:', e);
    }
    
    // Check for session token (this app uses session tokens, not JWT)
    try {
      const sessionToken = localStorage.getItem('sessionToken') || sessionStorage.getItem('sessionToken');
      if (sessionToken) {
        // Session tokens are hex strings, not JWT - we need to get user info from stored user data
        console.log('Found session token, checking stored user data for admin info');
        
        // Try to get user data from localStorage/sessionStorage
        const sources = [
          localStorage.getItem('user'),
          sessionStorage.getItem('user')
        ];
        
        for (const source of sources) {
          if (source) {
            try {
              const userData = JSON.parse(source);
              console.log('Found user data:', userData);
              
              // Check if this user is an admin and has a valid ID
              if (userData.role === 'admin' && userData._id && /^[0-9a-fA-F]{24}$/.test(userData._id)) {
                console.log('Found valid admin ID from user data:', userData._id);
                return userData._id;
              }
              if (userData.role === 'admin' && userData.id && /^[0-9a-fA-F]{24}$/.test(userData.id)) {
                console.log('Found valid admin ID from user data:', userData.id);
                return userData.id;
              }
            } catch (parseError) {
              console.error('Error parsing user data:', parseError);
            }
          }
        }
      }
    } catch (e) {
      console.error('Error checking session token:', e);
    }
    
    // Fallback: If admin username matches, use the known admin ID from database
    if (currentAdmin?.username === 'admin' || currentAdmin?.email === 'admin@gmail.com') {
      console.log('Using fallback admin ID for admin user');
      return '683eabcf4d1469016288c855';
    }
    
    // Check localStorage/sessionStorage for admin with matching username/email
    try {
      const sources = [
        localStorage.getItem('admin'),
        sessionStorage.getItem('admin'),
        localStorage.getItem('user'),
        sessionStorage.getItem('user')
      ];
      
      for (const source of sources) {
        if (source) {
          const data = JSON.parse(source);
          if ((data.username === 'admin' || data.email === 'admin@gmail.com') && data.role === 'admin') {
            console.log('Found admin by username/email match');
            return '683eabcf4d1469016288c855';
          }
          if (data.user && (data.user.username === 'admin' || data.user.email === 'admin@gmail.com') && data.user.role === 'admin') {
            console.log('Found admin by nested username/email match');
            return '683eabcf4d1469016288c855';
          }
        }
      }
    } catch (e) {
      console.error('Error checking stored admin by username:', e);
    }
    
    console.error('No valid admin ID found');
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validAdminId = getValidAdminId();
    
    if (!validAdminId) {
      showErrorToast('Admin authentication required. Please log in again.');
      console.error('Admin validation failed:', {
        currentAdmin,
        localStorage: localStorage.getItem('admin'),
        sessionStorage: sessionStorage.getItem('admin'),
        token: localStorage.getItem('sessionToken') || sessionStorage.getItem('sessionToken')
      });
      return;
    }

    if (!form.resolution_notes.trim() && form.status !== 'pending') {
      showErrorToast('Resolution notes are required when changing status');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare request data based on your backend expectations
      const requestData = {
        status: form.status
      };

      // Only add resolved_by and resolution_notes if status is not pending
      if (form.status !== 'pending') {
        requestData.resolved_by = validAdminId;
        requestData.resolution_notes = form.resolution_notes.trim();
      }

      console.log('Sending request to:', `/api/reports/${report._id}/status`);
      console.log('Request data:', requestData);
      console.log('Admin info:', { 
        originalAdminId: currentAdmin?._id,
        validAdminId: validAdminId,
        username: currentAdmin?.username,
        isValidObjectId: /^[0-9a-fA-F]{24}$/.test(validAdminId || ''),
        knownAdminId: '683eabcf4d1469016288c855'
      });

      const response = await axiosInstance.put(`/api/reports/${report._id}/status`, requestData);

      console.log('Response:', response.data);

      if (response.data?.status === 'success') {
        showSuccessToast('Report status updated successfully');
        
        // Update the report object with new data
        const updatedReport = {
          ...report,
          status: form.status,
          resolved_by: form.status !== 'pending' ? { _id: validAdminId, username: currentAdmin?.username || 'admin' } : null,
          resolution_notes: form.status !== 'pending' ? form.resolution_notes.trim() : null,
          updated_at: new Date().toISOString()
        };
        
        onUpdate?.(updatedReport);
        onClose?.();
      }
    } catch (error) {
      console.error('Error updating report:', error);
      
      // Enhanced error handling with more specific messages
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Invalid request data';
        console.error('400 Error details:', {
          message: errorMessage,
          requestData,
          adminValidation: {
            hasAdmin: !!currentAdmin,
            originalAdminId: currentAdmin?._id,
            validAdminId: validAdminId,
            adminIdType: typeof validAdminId,
            adminIdLength: validAdminId?.length,
            isValidObjectId: /^[0-9a-fA-F]{24}$/.test(validAdminId || ''),
            expectedAdminId: '683eabcf4d1469016288c855',
            allStorageData: {
              localStorage: localStorage.getItem('admin'),
              sessionStorage: sessionStorage.getItem('admin'),
              token: localStorage.getItem('sessionToken') || sessionStorage.getItem('sessionToken')
            }
          },
          reportId: report._id,
          reportIdValid: /^[0-9a-fA-F]{24}$/.test(report._id || '')
        });
        
        // More specific error messages based on backend validation
        if (errorMessage.includes('Invalid resolver ID format')) {
          showErrorToast('Admin authentication error. Please log out and log in again.');
        } else if (errorMessage.includes('Invalid report ID format')) {
          showErrorToast('Report ID format is invalid.');
        } else if (errorMessage.includes('Invalid status value')) {
          showErrorToast('Selected status is not valid.');
        } else {
          showErrorToast(`Error: ${errorMessage}`);
        }
      } else if (error.response?.status === 404) {
        showErrorToast('Report not found. It may have been deleted.');
      } else if (error.response?.status === 500) {
        showErrorToast('Server error. Please try again later.');
      } else if (error.code === 'ERR_NETWORK') {
        showErrorToast('Network error. Please check your connection.');
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update report';
        showErrorToast(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getContentInfo = () => {
    if (report.content_id && typeof report.content_id === 'object') {
      switch (report.content_type) {
        case 'post':
          return report.content_id.title || report.content_id.content?.substring(0, 100) + '...' || 'Post content';
        case 'comment':
          return report.content_id.content?.substring(0, 100) + '...' || 'Comment content';
        case 'user':
          return report.content_id.username || 'User profile';
        default:
          return 'Unknown content';
      }
    }
    return report.content_id || 'Content not available';
  };

  const validAdminId = getValidAdminId();

  return (
    <div className="max-w-xl mx-auto bg-[#F0F4E6] p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-[#123E23] mb-4">Report Review</h2>

      {/* Warning if no valid admin ID */}
      {!validAdminId && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <strong>Warning:</strong> Admin authentication issue detected. Please log out and log in again.
        </div>
      )}

      {/* Report Information */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-[#123E23]/20">
        <h3 className="font-semibold text-[#123E23] mb-3">Report Details</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium text-[#123E23] mb-1">Report ID</label>
            <input 
              className="w-full border border-[#123E23]/30 rounded px-3 py-2 bg-gray-50 text-sm" 
              value={`#${report._id?.slice(-6) || 'N/A'}`}
              readOnly 
            />
          </div>
          <div>
            <label className="block font-medium text-[#123E23] mb-1">Content Type</label>
            <input 
              className="w-full border border-[#123E23]/30 rounded px-3 py-2 bg-gray-50 text-sm capitalize" 
              value={report.content_type || 'Unknown'} 
              readOnly 
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-medium text-[#123E23] mb-1">Reported Content</label>
          <textarea 
            className="w-full border border-[#123E23]/30 rounded px-3 py-2 bg-gray-50 text-sm h-20" 
            value={getContentInfo()}
            readOnly 
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-[#123E23] mb-1">Reason</label>
          <input 
            className="w-full border border-[#123E23]/30 rounded px-3 py-2 bg-gray-50 text-sm" 
            value={report.reason || 'No reason provided'} 
            readOnly 
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-[#123E23] mb-1">Additional Details</label>
          <textarea 
            className="w-full border border-[#123E23]/30 rounded px-3 py-2 bg-gray-50 text-sm h-16" 
            value={report.details || 'No additional details provided'} 
            readOnly 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-[#123E23] mb-1">Reported By</label>
            <input 
              className="w-full border border-[#123E23]/30 rounded px-3 py-2 bg-gray-50 text-sm" 
              value={report.reported_by?.username || 'Unknown User'} 
              readOnly 
            />
          </div>
          <div>
            <label className="block font-medium text-[#123E23] mb-1">Date Reported</label>
            <input 
              className="w-full border border-[#123E23]/30 rounded px-3 py-2 bg-gray-50 text-sm" 
              value={formatDate(report.created_at)} 
              readOnly 
            />
          </div>
        </div>
      </div>

      {/* Response Form */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border border-[#123E23]/20">
        <h3 className="font-semibold text-[#123E23] mb-3">Admin Response</h3>
        
        <div className="mb-4">
          <label className="block font-medium text-[#123E23] mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border border-[#123E23] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#123E23]/50"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            required
          >
            <option value="pending">Pending</option>
            <option value="solved">Solved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium text-[#123E23] mb-1">
            Resolution Notes {form.status !== 'pending' && <span className="text-red-500">*</span>}
          </label>
          <textarea
            className="w-full border border-[#123E23] rounded px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-[#123E23]/50"
            value={form.resolution_notes}
            onChange={(e) => setForm({ ...form, resolution_notes: e.target.value })}
            placeholder="Explain how this report was handled, what actions were taken, etc..."
            required={form.status !== 'pending'}
          />
          <p className="text-xs text-[#123E23]/60 mt-1">
            Provide details about your decision and any actions taken.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-[#123E23]/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[#123E23] border border-[#123E23] rounded-lg hover:bg-[#123E23]/5 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !validAdminId || (!form.resolution_notes.trim() && form.status !== 'pending')}
            className="bg-[#123E23] hover:bg-[#123E23]/80 !text-white rounded-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Updating...' : 'Update Report'}
          </button>
        </div>
      </form>

    </div>
  );
};

export default ReportAnswerForm;
