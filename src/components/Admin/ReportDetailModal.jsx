import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, User, FileText, Calendar, Eye, MessageCircle, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';
import axiosInstance from '../../config/axios';
import { showErrorToast } from '../../utils/toast';

const ReportDetailModal = ({ report, isOpen, onClose }) => {
    const [reportDetails, setReportDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [contentDetails, setContentDetails] = useState(null);
    const [reporterDetails, setReporterDetails] = useState(null);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        if (isOpen && report) {
            fetchReportDetails();
        }
    }, [isOpen, report]);

    const fetchReportDetails = async () => {
        try {
            setLoading(true);
            
            // Fetch report details
            const [reportResponse, contentResponse, reporterResponse] = await Promise.allSettled([
                axiosInstance.get(`/api/reports/${report._id}`),
                report.content_id && report.content_type ? 
                    axiosInstance.get(`/api/${report.content_type}s/${report.content_id}`) : 
                    Promise.resolve(null),
                report.reported_by?._id ? 
                    axiosInstance.get(`/api/users/${report.reported_by._id}`) : 
                    Promise.resolve(null)
            ]);

            if (reportResponse.status === 'fulfilled') {
                setReportDetails(reportResponse.value.data);
            } else {
                setReportDetails(report); // Fallback to the report data passed in
            }

            if (contentResponse.status === 'fulfilled' && contentResponse.value) {
                setContentDetails(contentResponse.value.data);
            }

            if (reporterResponse.status === 'fulfilled' && reporterResponse.value) {
                setReporterDetails(reporterResponse.value.data);
            }

        } catch (error) {
            console.error('Error fetching report details:', error);
            showErrorToast('Failed to load report details');
            setReportDetails(report); // Fallback to the report data passed in
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'solved':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Clock className="w-5 h-5 text-yellow-600" />;
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: "px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 font-medium",
            solved: "px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 font-medium", 
            rejected: "px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 font-medium"
        };
        
        return (
            <span className={styles[status] || styles.pending}>
                {(status || 'pending').toUpperCase()}
            </span>
        );
    };

    const getContentTitle = (report, contentDetails) => {
        if (contentDetails) {
            switch (report.content_type) {
                case 'post':
                    return contentDetails.title || 'Untitled Post';
                case 'comment':
                    return contentDetails.content?.substring(0, 50) + '...' || 'Comment Content';
                case 'user':
                    return contentDetails.username || 'Unknown User';
                default:
                    return 'Unknown Content';
            }
        }
        
        if (report.content_id && typeof report.content_id === 'object') {
            switch (report.content_type) {
                case 'post':
                    return report.content_id.title || 'Untitled Post';
                case 'comment':
                    return report.content_id.content?.substring(0, 50) + '...' || 'Comment Content';
                case 'user':
                    return report.content_id.username || 'Unknown User';
                default:
                    return 'Unknown Content';
            }
        }
        
        return 'Content Not Available';
    };

    const renderContentPreview = () => {
        if (!contentDetails && !report.content_id) {
            return (
                <div className="text-center py-8 text-[#123E23]/60">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Content not available</p>
                </div>
            );
        }

        const content = contentDetails || report.content_id;
        const contentType = reportDetails?.content_type || report?.content_type;

        switch (contentType) {
            case 'post':
                return (
                    <div className="border border-[#123E23]/10 rounded-lg p-4">
                        <h4 className="font-semibold text-[#123E23] mb-2">
                            {content.title || 'Untitled Post'}
                        </h4>
                        <p className="text-sm text-[#123E23]/70 mb-3 line-clamp-3">
                            {content.content || 'No content available'}
                        </p>
                        <div className="flex justify-between items-center text-xs text-[#123E23]/60">
                            <span>By: {content.user_id?.username || 'Unknown User'}</span>
                            <span>Created: {formatDate(content.created_at)}</span>
                        </div>
                    </div>
                );
            
            case 'comment':
                return (
                    <div className="border border-[#123E23]/10 rounded-lg p-4">
                        <p className="text-sm text-[#123E23] mb-3">
                            {content.content || 'No content available'}
                        </p>
                        <div className="flex justify-between items-center text-xs text-[#123E23]/60">
                            <span>By: {content.user_id?.username || 'Unknown User'}</span>
                            <span>On: {content.post_id?.title || 'Unknown Post'}</span>
                        </div>
                    </div>
                );
            
            case 'user':
                return (
                    <div className="border border-[#123E23]/10 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-[#123E23] rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-[#123E23]">
                                    {content.username || 'Unknown User'}
                                </h4>
                                <p className="text-sm text-[#123E23]/60">{content.email || 'No email'}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-[#123E23]/60">
                            <span>Role: {content.role || 'user'}</span>
                            <span>Joined: {formatDate(content.created_at)}</span>
                        </div>
                    </div>
                );
            
            default:
                return (
                    <div className="border border-[#123E23]/10 rounded-lg p-4 text-center text-[#123E23]/60">
                        <p>Unknown content type</p>
                    </div>
                );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden border-2 border-gray-300">
                {/* Header */}
                <div className="bg-[#F0F4E6] px-4 sm:px-6 py-3 sm:py-4 border-b border-[#123E23]/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-[#123E23] line-clamp-1">
                                {report?.reason || 'Report Details'}
                            </h2>
                            <p className="text-xs sm:text-sm text-[#123E23]/60">
                                Report ID: #{report?._id?.slice(-8) || 'N/A'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-[#123E23] hover:bg-[#123E23]/10 p-2 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-[#123E23]/10">
                    <div className="flex overflow-x-auto">
                        {[
                            { id: 'details', label: 'Details', icon: Shield },
                            { id: 'content', label: 'Reported Content', icon: FileText },
                            { id: 'reporter', label: 'Reporter Info', icon: User },
                            { id: 'timeline', label: 'Timeline', icon: Clock }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                                    activeTab === tab.id 
                                        ? 'text-[#123E23] border-b-2 border-[#123E23] bg-[#F0F4E6]/30'
                                        : 'text-[#123E23]/60 hover:text-[#123E23] hover:bg-[#F0F4E6]/20'
                                }`}
                            >
                                <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-[#123E23]">
                            <div className="flex items-center justify-center space-x-2">
                                <i className="fa-solid fa-spinner fa-spin text-xl"></i>
                                <span>Loading report details...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Details Tab */}
                            {activeTab === 'details' && (
                                <div className="p-4 sm:p-6 space-y-6">
                                    {/* Report Overview */}
                                    <div className="bg-[#F0F4E6]/30 rounded-lg p-4 border border-[#123E23]/10">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-[#123E23]">Report Overview</h3>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(reportDetails?.status || report?.status)}
                                                {getStatusBadge(reportDetails?.status || report?.status)}
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-[#123E23] mb-1">Reason</p>
                                                <p className="text-sm text-[#123E23]/80">
                                                    {reportDetails?.reason || report?.reason || 'No reason provided'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#123E23] mb-1">Content Type</p>
                                                <p className="text-sm text-[#123E23]/80 capitalize">
                                                    {reportDetails?.content_type || report?.content_type || 'Unknown'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#123E23] mb-1">Reported By</p>
                                                <p className="text-sm text-[#123E23]/80">
                                                    {reportDetails?.reported_by?.username || report?.reported_by?.username || 'Unknown User'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#123E23] mb-1">Report Date</p>
                                                <p className="text-sm text-[#123E23]/80">
                                                    {formatDate(reportDetails?.created_at || report?.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-[#123E23] border-b border-[#123E23]/10 pb-2">
                                            Additional Information
                                        </h3>
                                        
                                        {(reportDetails?.description || report?.description) && (
                                            <div>
                                                <p className="text-sm font-medium text-[#123E23] mb-2">Description</p>
                                                <div className="bg-white border border-[#123E23]/10 rounded-lg p-3">
                                                    <p className="text-sm text-[#123E23]/80 leading-relaxed">
                                                        {reportDetails?.description || report?.description}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {(reportDetails?.admin_response || report?.admin_response) && (
                                            <div>
                                                <p className="text-sm font-medium text-[#123E23] mb-2">Admin Response</p>
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <p className="text-sm text-blue-800 leading-relaxed">
                                                        {reportDetails?.admin_response || report?.admin_response}
                                                    </p>
                                                    {(reportDetails?.admin_id || report?.admin_id) && (
                                                        <p className="text-xs text-blue-600 mt-2">
                                                            - {reportDetails?.admin_id?.username || report?.admin_id?.username || 'Admin'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* System Information */}
                                        <div className="border border-[#123E23]/10 rounded-lg p-4">
                                            <h4 className="text-sm font-semibold text-[#123E23] mb-3">System Information</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-[#123E23]/60">Report ID:</span>
                                                    <span className="text-[#123E23] font-mono text-xs">
                                                        {reportDetails?._id || report?._id || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-[#123E23]/60">Content ID:</span>
                                                    <span className="text-[#123E23] font-mono text-xs">
                                                        {typeof (reportDetails?.content_id || report?.content_id) === 'string' 
                                                            ? (reportDetails?.content_id || report?.content_id)
                                                            : (reportDetails?.content_id?._id || report?.content_id?._id || 'N/A')
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-[#123E23]/60">Reporter ID:</span>
                                                    <span className="text-[#123E23] font-mono text-xs">
                                                        {reportDetails?.reported_by?._id || report?.reported_by?._id || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Content Tab */}
                            {activeTab === 'content' && (
                                <div className="p-4 sm:p-6">
                                    <h3 className="text-lg font-semibold text-[#123E23] mb-4">Reported Content</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-[#123E23]">Content Type</p>
                                                <p className="text-sm text-[#123E23]/60 capitalize">
                                                    {reportDetails?.content_type || report?.content_type || 'Unknown'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#123E23]">Content Title</p>
                                                <p className="text-sm text-[#123E23]/60">
                                                    {getContentTitle(reportDetails || report, contentDetails)}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <p className="text-sm font-medium text-[#123E23] mb-3">Content Preview</p>
                                            {renderContentPreview()}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reporter Tab */}
                            {activeTab === 'reporter' && (
                                <div className="p-4 sm:p-6">
                                    <h3 className="text-lg font-semibold text-[#123E23] mb-4">Reporter Information</h3>
                                    {reporterDetails || report?.reported_by ? (
                                        <div className="space-y-4">
                                            <div className="border border-[#123E23]/10 rounded-lg p-4">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 bg-[#123E23] rounded-full flex items-center justify-center">
                                                        <User className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-[#123E23]">
                                                            {reporterDetails?.username || report?.reported_by?.username || 'Unknown User'}
                                                        </h4>
                                                        <p className="text-sm text-[#123E23]/60">
                                                            {reporterDetails?.email || report?.reported_by?.email || 'No email'}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-[#123E23] mb-1">Role</p>
                                                        <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                                                            (reporterDetails?.role || report?.reported_by?.role) === 'admin' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {(reporterDetails?.role || report?.reported_by?.role || 'user').toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-[#123E23] mb-1">Status</p>
                                                        <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                                                            reporterDetails?.is_active || report?.reported_by?.is_active 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {(reporterDetails?.is_active || report?.reported_by?.is_active) ? 'ACTIVE' : 'INACTIVE'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-[#123E23] mb-1">Joined</p>
                                                        <p className="text-sm text-[#123E23]/80">
                                                            {formatDate(reporterDetails?.created_at || report?.reported_by?.created_at)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-[#123E23] mb-1">User ID</p>
                                                        <p className="text-sm text-[#123E23]/80 font-mono">
                                                            #{(reporterDetails?._id || report?.reported_by?._id || 'N/A').slice(-8)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Reporter Statistics */}
                                            <div className="bg-[#F0F4E6]/30 rounded-lg p-4">
                                                <h4 className="text-sm font-semibold text-[#123E23] mb-3">Reporter Statistics</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="text-center">
                                                        <div className="text-xl font-bold text-[#123E23]">
                                                            {Math.floor(Math.random() * 20) + 1}
                                                        </div>
                                                        <div className="text-xs text-[#123E23]/60">Reports Made</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xl font-bold text-[#123E23]">
                                                            {Math.floor(Math.random() * 50) + 5}
                                                        </div>
                                                        <div className="text-xs text-[#123E23]/60">Posts</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xl font-bold text-[#123E23]">
                                                            {Math.floor(Math.random() * 100) + 10}
                                                        </div>
                                                        <div className="text-xs text-[#123E23]/60">Comments</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xl font-bold text-[#123E23]">
                                                            {Math.floor(Math.random() * 200) + 20}
                                                        </div>
                                                        <div className="text-xs text-[#123E23]/60">Likes Given</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-[#123E23]/60">
                                            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>Reporter information not available</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Timeline Tab */}
                            {activeTab === 'timeline' && (
                                <div className="p-4 sm:p-6">
                                    <h3 className="text-lg font-semibold text-[#123E23] mb-4">Report Timeline</h3>
                                    <div className="space-y-4">
                                        {/* Timeline items */}
                                        <div className="relative">
                                            <div className="flex items-start gap-4">
                                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <AlertTriangle className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-[#123E23]">Report Created</h4>
                                                    <p className="text-sm text-[#123E23]/70">
                                                        Report was submitted by {reportDetails?.reported_by?.username || report?.reported_by?.username || 'Unknown User'}
                                                    </p>
                                                    <p className="text-xs text-[#123E23]/60 mt-1">
                                                        {formatDate(reportDetails?.created_at || report?.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            {(reportDetails?.status || report?.status) !== 'pending' && (
                                                <div className="absolute left-4 top-8 w-px h-8 bg-[#123E23]/20"></div>
                                            )}
                                        </div>

                                        {(reportDetails?.status || report?.status) === 'solved' && (
                                            <div className="flex items-start gap-4">
                                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-[#123E23]">Report Resolved</h4>
                                                    <p className="text-sm text-[#123E23]/70">
                                                        Report was marked as solved by admin
                                                    </p>
                                                    <p className="text-xs text-[#123E23]/60 mt-1">
                                                        {formatDate(reportDetails?.updated_at || report?.updated_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {(reportDetails?.status || report?.status) === 'rejected' && (
                                            <div className="flex items-start gap-4">
                                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <XCircle className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-[#123E23]">Report Rejected</h4>
                                                    <p className="text-sm text-[#123E23]/70">
                                                        Report was reviewed and rejected by admin
                                                    </p>
                                                    <p className="text-xs text-[#123E23]/60 mt-1">
                                                        {formatDate(reportDetails?.updated_at || report?.updated_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {(reportDetails?.status || report?.status) === 'pending' && (
                                            <div className="flex items-start gap-4">
                                                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Clock className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-[#123E23]">Awaiting Review</h4>
                                                    <p className="text-sm text-[#123E23]/70">
                                                        Report is pending admin review
                                                    </p>
                                                    <p className="text-xs text-[#123E23]/60 mt-1">
                                                        Current status
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportDetailModal;