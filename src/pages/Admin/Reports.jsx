import SideMenu from "../../components/Admin/SideMenu";
import React, { useState, useEffect } from 'react';
import logo_ad from '../../assets/logo_admin.svg';
import { Eye, Trash2, Filter, SquarePen, BadgeMinus } from "lucide-react";
import axiosInstance from '../../config/axios';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/toast.jsx';
import ReportAnswerForm from "../../components/Admin/ReportAdmin.jsx";

export default function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalReports, setTotalReports] = useState(0);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedReport, setSelectedReport] = useState(null);
    const [showReportForm, setShowReportForm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const reportsPerPage = 10;

    useEffect(() => {
        fetchReports();
    }, [currentPage, statusFilter]);

    // Update selectAll state when selectedIds changes
    useEffect(() => {
        setSelectAll(selectedIds.length === reports.length && reports.length > 0);
    }, [selectedIds, reports]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/reports', {
                params: {
                    page: currentPage,
                    limit: reportsPerPage,
                    status: statusFilter !== 'all' ? statusFilter : undefined
                }
            });

            if (response.data?.status === 'success') {
                setReports(response.data.data);
                setTotalReports(response.data.count || 0);
            }
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError(err.response?.data?.message || 'Failed to load reports');
            showErrorToast('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: "px-2 py-1 text-xs rounded-full bg-yellow-100 !text-[#CA8A04] uppercase tracking-wide",
            solved: "px-2 py-1 text-xs rounded-full !bg-[#DDF4A6] text-green-800 uppercase tracking-wide", 
            rejected: "px-2 py-1 text-xs rounded-full bg-red-100 !text-[#DC2626] uppercase tracking-wide"
        };
        
        const statusText = {
            pending: "PENDING",
            solved: "SOLVED", 
            rejected: "REJECTED"
        };
        
        return (
            <span className={styles[status] || styles.pending}>
                {statusText[status] || "PENDING"}
            </span>
        );
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedIds([]);
        } else {
            setSelectedIds(reports.map(report => report._id));
        }
        setSelectAll(!selectAll);
    };

    const handleViewReport = (report) => {
        setSelectedReport(report);
        setShowReportForm(true);
    };

    const handleCloseReportForm = () => {
        setShowReportForm(false);
        setSelectedReport(null);
    };

    const handleReportUpdate = (updatedReport) => {
        setReports(prevReports =>
            prevReports.map(report =>
                report._id === updatedReport._id ? updatedReport : report
            )
        );
        setShowReportForm(false);
        setSelectedReport(null);
        showSuccessToast('Report updated successfully');
    };

    const handleDeleteReport = async (reportId) => {
        if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
            try {
                await axiosInstance.delete(`/api/reports/${reportId}`);
                setReports(prevReports => prevReports.filter(report => report._id !== reportId));
                setSelectedIds(prevIds => prevIds.filter(id => id !== reportId));
                showSuccessToast('Report deleted successfully');
            } catch (error) {
                console.error('Error deleting report:', error);
                showErrorToast('Failed to delete report');
            }
        }
    };

    // Bulk delete functionality
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            showErrorToast('Please select reports to delete');
            return;
        }

        const selectedReportReasons = reports
            .filter(report => selectedIds.includes(report._id))
            .map(report => report.reason)
            .join(', ');

        if (window.confirm(
            `Are you sure you want to delete ${selectedIds.length} report(s)?\n\nReports to be deleted:\n${selectedReportReasons}\n\nThis action cannot be undone.`
        )) {
            setIsDeleting(true);
            try {
                // Delete reports in parallel
                const deletePromises = selectedIds.map(reportId => 
                    axiosInstance.delete(`/api/reports/${reportId}`)
                );

                const results = await Promise.allSettled(deletePromises);
                
                // Check for any failures
                const failures = results.filter(result => result.status === 'rejected');
                const successes = results.filter(result => result.status === 'fulfilled');

                if (failures.length > 0) {
                    console.error('Some deletions failed:', failures);
                    showErrorToast(`${failures.length} out of ${selectedIds.length} deletions failed`);
                } else {
                    showSuccessToast(`${successes.length} reports deleted successfully`);
                }

                // Remove successfully deleted reports from the list
                const successfullyDeletedIds = selectedIds.slice(0, successes.length);
                setReports(prevReports => 
                    prevReports.filter(report => !successfullyDeletedIds.includes(report._id))
                );
                setSelectedIds([]);
                setSelectAll(false);

                // Refresh the data to ensure consistency
                await fetchReports();

            } catch (error) {
                console.error('Error during bulk delete:', error);
                showErrorToast('Failed to delete selected reports');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const getContentTitle = (report) => {
        if (report.content_id && typeof report.content_id === 'object') {
            switch (report.content_type) {
                case 'post':
                    return report.content_id.title || 'Unknown Post';
                case 'comment':
                    return report.content_id.content?.substring(0, 50) + '...' || 'Unknown Comment';
                case 'user':
                    return report.content_id.username || 'Unknown User';
                default:
                    return 'Unknown Content';
            }
        }
        return 'Content Not Found';
    };

    const totalPages = Math.ceil(totalReports / reportsPerPage);
    const startIndex = (currentPage - 1) * reportsPerPage + 1;
    const endIndex = Math.min(currentPage * reportsPerPage, totalReports);

    return (
        <div className="flex flex-col lg:flex-row w-full h-screen">
            <SideMenu />
            <div className="body_contain flex-1 p-4 lg:p-8 bg-[#FCFCF4] overflow-x-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 lg:mb-6 gap-4 sm:gap-0">
                    <h1 className="text-2xl lg:text-3xl font-bold text-[#123E23]">Reports ({totalReports})</h1>
                    <button className="admin-icon p-2 hover:bg-[#FCFCF4] rounded-lg transition-all duration-200">
                        <img src={logo_ad} className="w-6 h-6 lg:w-8 lg:h-8" alt="Admin" />
                    </button>
                </div>

                {/* Reports Table */}
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

                            {/* Bulk Delete Action */}
                            {selectedIds.length > 0 && (
                                <div className="flex items-center gap-1 lg:gap-2">
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
                                </div>
                            )}

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-2 lg:px-3 py-1.5 text-xs lg:text-sm bg-[#FCFCF4] text-[#123E23] rounded-lg border border-[#123E23]/20"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="solved">Solved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="text-xs lg:text-sm text-[#123E23]/60 w-full sm:w-auto text-left sm:text-right">
                            {selectedIds.length} selected
                        </div>
                    </div>

                    {/* Bulk Action Confirmation Bar */}
                    {selectedIds.length > 0 && (
                        <div className="bg-red-50 border-b border-red-200 px-3 lg:px-4 py-2">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                                <span className="text-xs lg:text-sm text-red-800">
                                    <i className="fa-solid fa-info-circle mr-2"></i>
                                    {selectedIds.length} report(s) selected. Choose an action above.
                                </span>
                                <button
                                    onClick={() => {
                                        setSelectedIds([]);
                                        setSelectAll(false);
                                    }}
                                    className="text-xs lg:text-sm text-red-600 hover:text-red-800 underline"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mobile Card View */}
                    <div className="lg:hidden">
                        {loading ? (
                            <div className="p-8 text-center text-[#123E23]">
                                <div className="flex items-center justify-center space-x-2">
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    <span>Loading reports...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center text-red-600">
                                <div className="flex flex-col items-center space-y-2">
                                    <span>{error}</span>
                                    <button 
                                        onClick={fetchReports}
                                        className="px-4 py-2 bg-[#123E23] text-white rounded-lg hover:bg-[#123E23]/80"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="p-8 text-center text-[#123E23]/60">
                                No reports found
                            </div>
                        ) : (
                            reports.map((report) => (
                                <div 
                                    key={report._id} 
                                    className={`border-b border-[#123E23]/10 p-4 ${
                                        selectedIds.includes(report._id) ? 'bg-red-50' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox w-4 h-4 rounded border-[#123E23]/20"
                                                checked={selectedIds.includes(report._id)}
                                                onChange={() => toggleSelect(report._id)}
                                            />
                                            <div>
                                                <div className="font-medium text-[#123E23] line-clamp-2">{report.reason}</div>
                                                <div className="text-sm text-[#123E23]/60">#{report._id.slice(-6)}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                className="p-1 hover:bg-[#FCFCF4] rounded-lg transition-colors"
                                                onClick={() => handleViewReport(report)}
                                            >
                                                <SquarePen className="w-4 h-4 text-[#123E23]" />
                                            </button>
                                            <button 
                                                className="p-1 hover:bg-[#FCFCF4] rounded-lg transition-colors"
                                                onClick={() => handleDeleteReport(report._id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-[#123E23]" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 mb-3">
                                        <div className="text-sm">
                                            <span className="font-medium text-[#123E23]">Type:</span>{' '}
                                            <span className="capitalize text-[#123E23]/80">{report.content_type}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium text-[#123E23]">Content:</span>{' '}
                                            <span className="text-[#123E23]/80 line-clamp-2">{getContentTitle(report)}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium text-[#123E23]">Reported by:</span>{' '}
                                            <span className="text-[#123E23]/80">{report.reported_by?.username || 'Unknown User'}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-[#123E23]/60">
                                            {formatDate(report.created_at)}
                                        </div>
                                        <div>
                                            {getStatusBadge(report.status)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
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
                                    <th className="px-4 py-3 font-medium text-left">REASON</th>
                                    <th className="px-4 py-3 font-medium text-left">TYPE</th>
                                    <th className="px-4 py-3 font-medium text-left">CONTENT</th>
                                    <th className="px-4 py-3 font-medium text-left">REPORTED BY</th>
                                    <th className="px-4 py-3 font-medium text-left">DATE</th>
                                    <th className="px-4 py-3 font-medium text-center">STATUS</th>
                                    <th className="px-4 py-3 font-medium text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#123E23]/10">
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="px-4 py-8 text-center text-[#123E23]">
                                            <div className="flex items-center justify-center space-x-2">
                                                <i className="fa-solid fa-spinner fa-spin"></i>
                                                <span>Loading reports...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="9" className="px-4 py-8 text-center text-red-600">
                                            <div className="flex flex-col items-center space-y-2">
                                                <span>{error}</span>
                                                <button 
                                                    onClick={fetchReports}
                                                    className="px-4 py-2 bg-[#123E23] text-white rounded-lg hover:bg-[#123E23]/80"
                                                >
                                                    Retry
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : reports.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-4 py-8 text-center text-[#123E23]/60">
                                            No reports found
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map((report) => (
                                        <tr 
                                            key={report._id} 
                                            className={`hover:bg-[#F0F4E6]/50 transition-colors ${
                                                selectedIds.includes(report._id) ? 'bg-red-50' : ''
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox w-4 h-4 rounded border-[#123E23]/20"
                                                    checked={selectedIds.includes(report._id)}
                                                    onChange={() => toggleSelect(report._id)}
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-medium text-[#123E23]">
                                                #{report._id.slice(-6)}
                                            </td>
                                            <td className="px-4 py-3 text-[#123E23] max-w-xs">
                                                <div className="truncate" title={report.reason}>
                                                    {report.reason}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-[#123E23] capitalize">
                                                {report.content_type}
                                            </td>
                                            <td className="px-4 py-3 text-[#123E23] max-w-xs">
                                                <div className="truncate" title={getContentTitle(report)}>
                                                    {getContentTitle(report)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-[#123E23]">
                                                {report.reported_by?.username || 'Unknown User'}
                                            </td>
                                            <td className="px-4 py-3 text-[#123E23]">
                                                {formatDate(report.created_at)}
                                            </td>
                                            <td className="px-4 py-3 font-semibold uppercase text-center">
                                                {getStatusBadge(report.status)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center space-x-3">
                                                    <button 
                                                        onClick={() => handleViewReport(report)}
                                                        className="p-1 hover:bg-[#FCFCF4] rounded-lg transition-colors cursor-pointer"
                                                        title="View and respond to report"
                                                    >
                                                        <SquarePen className="w-5 h-5 text-[#123E23]" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteReport(report._id)}
                                                        className="p-1 hover:bg-[#FCFCF4] rounded-lg transition-colors cursor-pointer"
                                                        title="Delete report"
                                                    >
                                                        <Trash2 className="w-5 h-5 text-[#123E23]" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
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
                            {totalReports > 0 ? `${startIndex}–${endIndex} of ${totalReports}` : '0 reports'}
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

                {/* Report Answer Form Modal - Mobile Responsive */}
                {showReportForm && selectedReport && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-[95vw] sm:max-w-2xl max-h-[95vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-[#123E23]/10 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                                <h2 className="text-lg sm:text-xl font-bold text-[#123E23]">
                                    <span className="hidden sm:inline">Report Details & Response</span>
                                    <span className="sm:hidden">Report Response</span>
                                </h2>
                                <button 
                                    onClick={handleCloseReportForm}
                                    className="text-[#123E23] hover:bg-[#F0F4E6] p-2 rounded-lg transition-colors"
                                >
                                    <i className="fa-solid fa-times text-base sm:text-lg"></i>
                                </button>
                            </div>
                            <div className="p-4 sm:p-6">
                                <ReportAnswerForm 
                                    report={selectedReport}
                                    currentAdmin={{ _id: 'admin_user_id', username: 'Admin' }} // Replace with actual admin data
                                    onUpdate={handleReportUpdate}
                                    onClose={handleCloseReportForm}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}