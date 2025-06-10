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
        <div className="flex flex-row w-full h-screen">
            <SideMenu />
            <div className="body_contain flex-1 p-8 bg-[#FCFCF4]">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#123E23]">Reports ({totalReports})</h1>
                    <button className="admin-icon p-2 hover:bg-[#FCFCF4] rounded-lg transition-all duration-200">
                        <img src={logo_ad} className="w-8 h-8" alt="Admin" />
                    </button>
                </div>

                {/* Reports Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-[#123E23]/20">
                    {/* Table Controls */}
                    <div className="flex items-center justify-between p-4 border-b border-[#123E23]/10">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
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
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handleBulkDelete}
                                        disabled={isDeleting}
                                        className="px-3 py-1.5 text-sm bg-[#FFE9DA] !text-[#7A0E27] flex items-center rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <BadgeMinus className="w-4 h-4 self-center inline-block mr-2" color="#7A0E27" />
                                                ({selectedIds.length})
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-1.5 text-sm bg-[#FCFCF4] text-[#123E23] rounded-lg border border-[#123E23]/20"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="solved">Solved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="text-sm text-[#123E23]/60">
                            {selectedIds.length} selected
                        </div>
                    </div>

                    {/* Bulk Action Confirmation Bar */}
                    {selectedIds.length > 0 && (
                        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-red-800">
                                    <i className="fa-solid fa-info-circle mr-2"></i>
                                    {selectedIds.length} report(s) selected. Choose an action above.
                                </span>
                                <button
                                    onClick={() => {
                                        setSelectedIds([]);
                                        setSelectAll(false);
                                    }}
                                    className="text-sm text-red-600 hover:text-red-800 underline"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
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
                    <div className="flex items-center justify-between px-4 py-3 border-t border-[#123E23]/10">
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

                {/* Report Answer Form Modal */}
                {showReportForm && selectedReport && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-[#123E23]/10 px-6 py-4 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-[#123E23]">
                                    Report Details & Response
                                </h2>
                                <button 
                                    onClick={handleCloseReportForm}
                                    className="text-[#123E23] hover:bg-[#F0F4E6] p-2 rounded-lg transition-colors"
                                >
                                    <i className="fa-solid fa-times text-lg"></i>
                                </button>
                            </div>
                            <div className="p-6">
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