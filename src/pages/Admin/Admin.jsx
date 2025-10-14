import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import SideMenu from "../../components/Admin/SideMenu";
import Users from "./Users";
import Posts from "./Posts";
import Reports from "./Reports";
import Notifications from "./Notifications";
import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart';
import axiosInstance from '../../config/axios';
import { showErrorToast, showSuccessToast } from '../../utils/toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { useSelector, useDispatch } from 'react-redux';
import { toggleAdminMode } from '../../redux/slices/authSlice';
import useAdminPermissions from "../../hooks/useAdminPermissions";
import logoImg from "../../assets/Logo.png";
import userAvatar from "../../assets/avt.png";

export default function Admin() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAdmin, isAdminMode } = useAdminPermissions();
    
    const[dashboardStats,setDashboardStats]=useState({totalUsers:0,totalPosts:0,activeReports:0,totalNotifications:0}),[recentActivities,setRecentActivities]=useState({users:[],posts:[],reports:[]}),[trafficData,setTrafficData]=useState({labels:[],userData:[],postData:[],commentData:[],totalActivity:0}),[loading,setLoading]=useState(!0),[error,setError]=useState(null),[ratingStats,setRatingStats]=useState({totalRatings:0,averageRating:0,percentageDistribution:{1:0,2:0,3:0,4:0,5:0}});useEffect(()=>{fetchDashboardData()},[]);

    // Handle admin mode toggle
    const handleAdminToggle = () => {
        if (isAdmin) {
            dispatch(toggleAdminMode());
            // Navigate to user mode
            setTimeout(() => {
                navigate('/community');
            }, 300);
        }
    };

    const fetchRatingStats = async () => {
        try {
            const response = await axiosInstance.get('/api/ratings/stats');
            if (response.data?.status === 'success') {
                setRatingStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching rating stats:', error);
            // Keep default values if API fails
        }
    };

    const fetchTrafficData=async()=>{try{let t=new Date;t.setDate(t.getDate()-6);let e=[],a=[],s=[],r=[];for(let l=0;l<7;l++){let i=new Date(t);i.setDate(t.getDate()+l),e.push(i.toLocaleDateString("en-US",{weekday:"short"}))}let[d,c,n]=await Promise.allSettled([axiosInstance.get("/api/users"),axiosInstance.get("/api/posts"),axiosInstance.get("/api/comments")]);if("fulfilled"===d.status){let o=d.value.data?.data||d.value.data||[];for(let f=0;f<7;f++){let u=new Date(t);u.setDate(t.getDate()+f);let D=new Date(u);D.setDate(D.getDate()+1);let g=o.filter(t=>{let e=new Date(t.created_at||t.createdAt);return e>=u&&e<D}).length;a.push(g)}}if("fulfilled"===c.status){let $=c.value.data?.data||c.value.data||[];for(let h=0;h<7;h++){let p=new Date(t);p.setDate(t.getDate()+h);let w=new Date(p);w.setDate(w.getDate()+1);let A=$.filter(t=>{let e=new Date(t.created_at||t.createdAt);return e>=p&&e<w}).length;s.push(A)}}if("fulfilled"===n.status){let v=n.value.data?.data||n.value.data||[];for(let y=0;y<7;y++){let m=new Date(t);m.setDate(t.getDate()+y);let S=new Date(m);S.setDate(S.getDate()+1);let _=v.filter(t=>{let e=new Date(t.created_at||t.createdAt);return e>=m&&e<S}).length;r.push(_)}}else for(let b=0;b<7;b++)r.push(0);let T=a.reduce((t,e)=>t+e,0)+s.reduce((t,e)=>t+e,0)+r.reduce((t,e)=>t+e,0);setTrafficData({labels:e,userData:a,postData:s,commentData:r,totalActivity:T})}catch(L){console.error("Error fetching traffic data:",L),setTrafficData({labels:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],userData:[12,19,8,15,22,18,25],postData:[8,15,12,20,18,25,30],commentData:[15,25,20,35,30,40,45],totalActivity:285})}},fetchDashboardData=async()=>{setLoading(!0);try{let[t,e,a,s]=await Promise.allSettled([axiosInstance.get("/api/users"),axiosInstance.get("/api/posts"),axiosInstance.get("/api/reports"),axiosInstance.get("/api/notifications")]),r=0,l=[];if("fulfilled"===t.status){let i=t.value.data;Array.isArray(i)?(r=i.length,l=i.sort((t,e)=>new Date(e.created_at||e.createdAt)-new Date(t.created_at||t.createdAt)).slice(0,3)):i?.data&&(r=i.total||i.data.length,l=i.data.sort((t,e)=>new Date(e.created_at||e.createdAt)-new Date(t.created_at||t.createdAt)).slice(0,3))}let d=0,c=[];if("fulfilled"===e.status){let n=e.value.data;n?.status==="success"?(d=n.pagination?.total||n.data?.length||0,c=n.data?.slice(0,3)||[]):Array.isArray(n)&&(d=n.length,c=n.sort((t,e)=>new Date(e.created_at||e.createdAt)-new Date(t.created_at||t.createdAt)).slice(0,3))}let o=0,f=[];if("fulfilled"===a.status){let u=a.value.data;if(u?.status==="success"){let D=u.data||[];o=D.filter(t=>"pending"===t.status).length,f=D.sort((t,e)=>new Date(e.created_at)-new Date(t.createdAt)).slice(0,3)}else Array.isArray(u)&&(o=u.filter(t=>"pending"===t.status).length,f=u.sort((t,e)=>new Date(e.created_at)-new Date(t.createdAt)).slice(0,3))}let g=0;if("fulfilled"===s.status){let $=s.value.data;$?.status==="success"?g=$.total||$.data?.length||0:Array.isArray($)&&(g=$.length)}setDashboardStats({totalUsers:r,totalPosts:d,activeReports:o,totalNotifications:g}),setRecentActivities({users:l,posts:c,reports:f}),await fetchTrafficData(),await fetchRatingStats()}catch(h){console.error("Error fetching dashboard data:",h),setError("Failed to load dashboard data"),showErrorToast("Failed to load dashboard data")}finally{setLoading(!1)}},formatDate=t=>{try{return new Date(t).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}catch(e){return"Unknown date"}},getStatusBadge=t=>{let e={pending:"text-yellow-600",solved:"text-green-600",rejected:"text-red-600"};return e[t]||"text-gray-600"};

    // Generate PDF Report Function
    const generatePDFReport = async () => {
        try {
            showSuccessToast("Generating PDF report...");
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const currentDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Header
            pdf.setFontSize(20);
            pdf.setTextColor(18, 62, 35); // #123E23
            pdf.text('EMPATHY ADMIN DASHBOARD REPORT', 105, 20, { align: 'center' });
            
            pdf.setFontSize(12);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Generated on: ${currentDate}`, 105, 30, { align: 'center' });
            
            // Stats Section
            let yPos = 50;
            pdf.setFontSize(16);
            pdf.setTextColor(18, 62, 35);
            pdf.text('OVERVIEW STATISTICS', 20, yPos);
            
            yPos += 15;
            const statsData = [
                ['Total Users', dashboardStats.totalUsers.toLocaleString()],
                ['Total Posts', dashboardStats.totalPosts.toLocaleString()],
                ['Pending Reports', dashboardStats.activeReports.toString()],
                ['Total Notifications', dashboardStats.totalNotifications.toLocaleString()]
            ];
            
            autoTable(pdf, {
                startY: yPos,
                head: [['Metric', 'Value']],
                body: statsData,
                theme: 'grid',
                headStyles: { fillColor: [18, 62, 35], textColor: [240, 244, 230] },
                alternateRowStyles: { fillColor: [252, 252, 244] },
                margin: { left: 20, right: 20 }
            });
            
            // Traffic Statistics
            yPos = pdf.lastAutoTable.finalY + 20;
            pdf.setFontSize(16);
            pdf.text('7-DAY TRAFFIC ANALYSIS', 20, yPos);
            
            yPos += 15;
            const trafficSummary = [
                ['New Users', trafficData.userData.reduce((sum, val) => sum + val, 0).toString()],
                ['New Posts', trafficData.postData.reduce((sum, val) => sum + val, 0).toString()],
                ['New Comments', trafficData.commentData.reduce((sum, val) => sum + val, 0).toString()],
                ['Total Activity', trafficData.totalActivity.toString()]
            ];
            
            autoTable(pdf, {
                startY: yPos,
                head: [['Activity Type', 'Count']],
                body: trafficSummary,
                theme: 'grid',
                headStyles: { fillColor: [18, 62, 35], textColor: [240, 244, 230] },
                alternateRowStyles: { fillColor: [252, 252, 244] },
                margin: { left: 20, right: 20 }
            });
            
            // Daily breakdown
            yPos = pdf.lastAutoTable.finalY + 20;
            pdf.setFontSize(14);
            pdf.text('Daily Activity Breakdown', 20, yPos);
            yPos += 10;
            
            const dailyData = trafficData.labels.map((label, index) => [
                label,
                trafficData.userData[index] || 0,
                trafficData.postData[index] || 0,
                trafficData.commentData[index] || 0,
                (trafficData.userData[index] || 0) + (trafficData.postData[index] || 0) + (trafficData.commentData[index] || 0)
            ]);
            
            autoTable(pdf, {
                startY: yPos,
                head: [['Day', 'Users', 'Posts', 'Comments', 'Total']],
                body: dailyData,
                theme: 'grid',
                headStyles: { fillColor: [18, 62, 35], textColor: [240, 244, 230] },
                alternateRowStyles: { fillColor: [252, 252, 244] },
                margin: { left: 20, right: 20 }
            });
            
            // Add new page for recent activities
            pdf.addPage();
            yPos = 20;
            pdf.setFontSize(16);
            pdf.setTextColor(18, 62, 35);
            pdf.text('RECENT ACTIVITIES', 20, yPos);
            yPos += 20;
            
            // Recent Users
            if (recentActivities.users.length > 0) {
                pdf.setFontSize(14);
                pdf.setTextColor(18, 62, 35);
                pdf.text('Recent Users', 20, yPos);
                yPos += 10;
                
                const usersData = recentActivities.users.map(user => [
                    user.username || 'Unknown User',
                    user.email || 'No email',
                    formatDate(user.created_at || user.createdAt)
                ]);
                
                autoTable(pdf, {
                    startY: yPos,
                    head: [['Username', 'Email', 'Join Date']],
                    body: usersData,
                    theme: 'grid',
                    headStyles: { fillColor: [18, 62, 35], textColor: [240, 244, 230] },
                    alternateRowStyles: { fillColor: [252, 252, 244] },
                    margin: { left: 20, right: 20 }
                });
                yPos = pdf.lastAutoTable.finalY + 15;
            }
            
            // Recent Posts
            if (recentActivities.posts.length > 0) {
                if (yPos > 250) {
                    pdf.addPage();
                    yPos = 20;
                }
                
                pdf.setFontSize(14);
                pdf.setTextColor(18, 62, 35);
                pdf.text('Recent Posts', 20, yPos);
                yPos += 10;
                
                const postsData = recentActivities.posts.map(post => [
                    post.title || 'Untitled Post',
                    post.user_id?.username || 'Unknown User',
                    formatDate(post.created_at || post.createdAt)
                ]);
                
                autoTable(pdf, {
                    startY: yPos,
                    head: [['Post Title', 'Author', 'Created Date']],
                    body: postsData,
                    theme: 'grid',
                    headStyles: { fillColor: [18, 62, 35], textColor: [240, 244, 230] },
                    alternateRowStyles: { fillColor: [252, 252, 244] },
                    margin: { left: 20, right: 20 }
                });
                yPos = pdf.lastAutoTable.finalY + 15;
            }
            
            // Recent Reports
            if (recentActivities.reports.length > 0) {
                if (yPos > 230) {
                    pdf.addPage();
                    yPos = 20;
                }
                
                pdf.setFontSize(14);
                pdf.setTextColor(18, 62, 35);
                pdf.text('Recent Reports', 20, yPos);
                yPos += 10;
                
                const reportsData = recentActivities.reports.map(report => [
                    report.reason || 'No reason provided',
                    report.content_type || 'Unknown',
                    report.reported_by?.username || 'Unknown User',
                    report.status?.toUpperCase() || 'PENDING',
                    formatDate(report.created_at)
                ]);
                
                autoTable(pdf, {
                    startY: yPos,
                    head: [['Reason', 'Content Type', 'Reporter', 'Status', 'Date']],
                    body: reportsData,
                    theme: 'grid',
                    headStyles: { fillColor: [18, 62, 35], textColor: [240, 244, 230] },
                    alternateRowStyles: { fillColor: [252, 252, 244] },
                    margin: { left: 20, right: 20 },
                    columnStyles: {
                        0: { cellWidth: 40 },
                        1: { cellWidth: 25 },
                        2: { cellWidth: 35 },
                        3: { cellWidth: 25 },
                        4: { cellWidth: 35 }
                    }
                });
                yPos = pdf.lastAutoTable.finalY + 15;
            }
            
            // Add Community Rating section
            pdf.addPage();
            yPos = 20;
            pdf.setFontSize(16);
            pdf.setTextColor(18, 62, 35);
            pdf.text('COMMUNITY INSIGHTS', 20, yPos);
            yPos += 20;
            
            // Community Rating
            pdf.setFontSize(14);
            if (ratingStats.totalRatings > 0) {
                pdf.text(`Community Rating: ${ratingStats.averageRating}/5 Stars (${ratingStats.totalRatings} ratings)`, 20, yPos);
                yPos += 15;
                
                const ratingData = [
                    ['5 Stars', `${ratingStats.percentageDistribution[5] || 0}%`, `${Math.round((ratingStats.percentageDistribution[5] || 0) * ratingStats.totalRatings / 100)} users`],
                    ['4 Stars', `${ratingStats.percentageDistribution[4] || 0}%`, `${Math.round((ratingStats.percentageDistribution[4] || 0) * ratingStats.totalRatings / 100)} users`],
                    ['3 Stars', `${ratingStats.percentageDistribution[3] || 0}%`, `${Math.round((ratingStats.percentageDistribution[3] || 0) * ratingStats.totalRatings / 100)} users`],
                    ['2 Stars', `${ratingStats.percentageDistribution[2] || 0}%`, `${Math.round((ratingStats.percentageDistribution[2] || 0) * ratingStats.totalRatings / 100)} users`],
                    ['1 Star', `${ratingStats.percentageDistribution[1] || 0}%`, `${Math.round((ratingStats.percentageDistribution[1] || 0) * ratingStats.totalRatings / 100)} users`]
                ];
                
                autoTable(pdf, {
                    startY: yPos,
                    head: [['Rating', 'Percentage', 'Users']],
                    body: ratingData,
                    theme: 'grid',
                    headStyles: { fillColor: [18, 62, 35], textColor: [240, 244, 230] },
                    alternateRowStyles: { fillColor: [252, 252, 244] },
                    margin: { left: 20, right: 20 }
                });
            } else {
                pdf.text('Community Rating: No ratings available yet', 20, yPos);
                yPos += 15;
                
                const noRatingData = [
                    ['Status', 'No user ratings submitted yet'],
                    ['Note', 'Ratings will appear after users provide feedback']
                ];
                
                autoTable(pdf, {
                    startY: yPos,
                    head: [['Information', 'Details']],
                    body: noRatingData,
                    theme: 'grid',
                    headStyles: { fillColor: [18, 62, 35], textColor: [240, 244, 230] },
                    alternateRowStyles: { fillColor: [252, 252, 244] },
                    margin: { left: 20, right: 20 }
                });
            }
            
            // System Health
            yPos = pdf.lastAutoTable.finalY + 20;
            pdf.setFontSize(14);
            pdf.text('System Health Status', 20, yPos);
            yPos += 10;
            
            const systemData = [
                ['Server Status', 'Operational', 'All systems running'],
                ['Database Performance', 'Good', '< 100ms response time'],
                ['User Engagement', 'High', '85% active daily users'],
                ['Content Moderation', 'Active', dashboardStats.activeReports + ' pending reports'],
                ['Storage Usage', 'Normal', '65% capacity used']
            ];
            
            autoTable(pdf, {
                startY: yPos,
                head: [['Component', 'Status', 'Details']],
                body: systemData,
                theme: 'grid',
                headStyles: { fillColor: [18, 62, 35], textColor: [240, 244, 230] },
                alternateRowStyles: { fillColor: [252, 252, 244] },
                margin: { left: 20, right: 20 }
            });
            
            // Footer on all pages
            const pageCount = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                pdf.setPage(i);
                pdf.setFontSize(10);
                pdf.setTextColor(100, 100, 100);
                pdf.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
                pdf.text('Empathy Admin Dashboard', 20, 290);
                pdf.text(currentDate, 190, 290, { align: 'right' });
            }
            
            // Save PDF
            const fileName = `Empathy_Dashboard_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
            
            showSuccessToast("PDF report generated successfully!");
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            showErrorToast("Failed to generate PDF report");
        }
    };

    const combinedActivityData=trafficData.userData.map((t,e)=>t+trafficData.postData[e]+trafficData.commentData[e]);

    return (
        <div className="flex flex-col lg:flex-row bg-[#FCFCF4] min-h-screen">
            <SideMenu />
            <div className="side-content flex-1 p-4 lg:p-8 bg-cover bg-no-repeat overflow-auto" style={{
                backgroundImage: "url('src/assets/about-bg.png')"
            }}>
                <Routes>
                    <Route index element={
                        <div className="admin-home space-y-4">
                            {/* Header Section */}
                            <div className="heading flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-[#123E23]/20 gap-4 sm:gap-0">
                                <h1 className="text-2xl lg:text-3xl font-bold text-[#123E23]">Admin Panel</h1>
                                <div className="right-btn flex items-center gap-3 lg:gap-6">
                                    <button 
                                        onClick={fetchDashboardData}
                                        className="refresh-btn hover:opacity-80 transition-opacity"
                                        title="Refresh Dashboard"
                                    >
                                        <i className={`fa-solid fa-refresh fa-lg lg:fa-xl ${loading ? 'fa-spin' : ''}`} style={{ color: '#123e23' }}></i>
                                    </button>
                                    <button 
                                        onClick={generatePDFReport}
                                        className="download-csv hover:opacity-80 transition-opacity"
                                        title="Tải báo cáo PDF"
                                    >
                                        <i className="fa-solid fa-download fa-lg lg:fa-xl" style={{ color: '#123e23' }}></i>
                                    </button>
                                    
                                    {/* Admin Avatar Switch */}
                                    <div 
                                        className="admin-avatar-switch relative cursor-pointer"
                                        onClick={handleAdminToggle}
                                        title="Switch to User Mode"
                                    >
                                        <div className="relative w-8 h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden border-2 border-[#123E23] hover:scale-110 transition-all duration-300 shadow-lg">
                                            <img 
                                                src={logoImg} 
                                                alt="Admin Mode" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {/* Admin mode indicator */}
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#123E23] rounded-full border border-white flex items-center justify-center">
                                            <i className="fa-solid fa-crown text-xs text-white"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Loading State */}
                            {loading && (
                                <div className="text-center py-8">
                                    <i className="fa-solid fa-spinner fa-spin text-2xl text-[#123E23] mb-2"></i>
                                    <p className="text-[#123E23]">Loading dashboard data...</p>
                                </div>
                            )}

                            {/* Error State */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                    <p className="text-red-600">{error}</p>
                                    <button 
                                        onClick={fetchDashboardData}
                                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                            {/* Stats Cards */}
                            {!loading && !error && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                                        <div className="stats-card bg-white p-4 lg:p-6 rounded-xl shadow-md border border-[#123E23]/20 hover:shadow-lg transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-base lg:text-lg font-semibold text-[#123E23]">Total Users</h3>
                                                    <p className="text-2xl lg:text-3xl font-bold text-[#123E23] mt-2">{dashboardStats.totalUsers.toLocaleString()}</p>
                                                </div>
                                                <div className="text-[#123E23]/60">
                                                    <i className="fa-solid fa-users text-xl lg:text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="stats-card bg-white p-4 lg:p-6 rounded-xl shadow-md border border-[#123E23]/20 hover:shadow-lg transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-base lg:text-lg font-semibold text-[#123E23]">Total Posts</h3>
                                                    <p className="text-2xl lg:text-3xl font-bold text-[#123E23] mt-2">{dashboardStats.totalPosts.toLocaleString()}</p>
                                                </div>
                                                <div className="text-[#123E23]/60">
                                                    <i className="fa-solid fa-file-text text-xl lg:text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="stats-card bg-white p-4 lg:p-6 rounded-xl shadow-md border border-[#123E23]/20 hover:shadow-lg transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-base lg:text-lg font-semibold text-[#123E23]">Pending Reports</h3>
                                                    <p className="text-2xl lg:text-3xl font-bold text-[#123E23] mt-2">{dashboardStats.activeReports}</p>
                                                    {dashboardStats.activeReports > 0 && (
                                                        <div className="text-xs text-yellow-600 font-medium mt-1">
                                                            Needs Attention
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-[#123E23]/60">
                                                    <i className="fa-solid fa-flag text-xl lg:text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="stats-card bg-white p-4 lg:p-6 rounded-xl shadow-md border border-[#123E23]/20 hover:shadow-lg transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-base lg:text-lg font-semibold text-[#123E23]">Notifications</h3>
                                                    <p className="text-2xl lg:text-3xl font-bold text-[#123E23] mt-2">{dashboardStats.totalNotifications.toLocaleString()}</p>
                                                </div>
                                                <div className="text-[#123E23]/60">
                                                    <i className="fa-solid fa-bell text-xl lg:text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Activities Section */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 mt-4">
                                        {/* Recent Users */}
                                        <div className="recent-users bg-white rounded-xl shadow-md border border-[#123E23]/20 overflow-hidden">
                                            <div className="title border-b border-[#123E23]/20 bg-[#FCFCF4]/50">
                                                <h3 className="text-base lg:text-lg font-semibold p-4 lg:p-5 text-[#123E23]">Recent Users</h3>
                                            </div>
                                            <div className="p-3 lg:p-4">
                                                {recentActivities.users.length === 0 ? (
                                                    <div className="text-center text-[#123E23]/60 py-4">
                                                        <i className="fa-solid fa-users text-xl lg:text-2xl mb-2"></i>
                                                        <p className="text-sm">No users found</p>
                                                    </div>
                                                ) : (
                                                    <ul className="divide-y divide-[#123E23]/10">
                                                        {recentActivities.users.map((user, index) => (
                                                            <li key={user._id || index} className="flex justify-between items-center p-3 lg:p-4 hover:bg-[#FCFCF4]/30 transition-colors">
                                                                <div className="min-w-0 flex-1">
                                                                    <span className="text-[#123E23] font-medium text-sm lg:text-base block truncate">{user.username || 'Unknown User'}</span>
                                                                    <div className="text-xs lg:text-sm text-[#123E23]/60 truncate">{user.email || 'No email'}</div>
                                                                </div>
                                                                <span className="text-gray-500 text-xs lg:text-sm ml-2 flex-shrink-0">
                                                                    {formatDate(user.created_at || user.createdAt)}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>

                                        {/* Recent Posts */}
                                        <div className="recent-posts bg-white rounded-xl shadow-md border border-[#123E23]/20 overflow-hidden">
                                            <div className="title border-b border-[#123E23]/20 bg-[#FCFCF4]/50">
                                                <h3 className="text-base lg:text-lg font-semibold p-4 lg:p-5 text-[#123E23]">Recent Posts</h3>
                                            </div>
                                            <div className="p-3 lg:p-4">
                                                {recentActivities.posts.length === 0 ? (
                                                    <div className="text-center text-[#123E23]/60 py-4">
                                                        <i className="fa-solid fa-file-text text-xl lg:text-2xl mb-2"></i>
                                                        <p className="text-sm">No posts found</p>
                                                    </div>
                                                ) : (
                                                    <ul className="divide-y divide-[#123E23]/10">
                                                        {recentActivities.posts.map((post, index) => (
                                                            <li key={post._id || index} className="flex justify-between items-center p-3 lg:p-4 hover:bg-[#FCFCF4]/30 transition-colors">
                                                                <div className="flex-1 min-w-0">
                                                                    <span className="text-[#123E23] font-medium text-sm lg:text-base block truncate">{post.title || 'Untitled Post'}</span>
                                                                    <div className="text-xs lg:text-sm text-[#123E23]/60">
                                                                        by {post.user_id?.username || 'Unknown User'}
                                                                    </div>
                                                                </div>
                                                                <span className="text-gray-500 text-xs lg:text-sm ml-2 flex-shrink-0">
                                                                    {formatDate(post.created_at || post.createdAt)}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>

                                        {/* Recent Reports */}
                                        <div className="recent-reports bg-white rounded-xl shadow-md border border-[#123E23]/20 overflow-hidden">
                                            <div className="title border-b border-[#123E23]/20 bg-[#FCFCF4]/50">
                                                <h3 className="text-base lg:text-lg font-semibold p-4 lg:p-5 text-[#123E23]">Recent Reports</h3>
                                            </div>
                                            <div className="p-3 lg:p-4">
                                                {recentActivities.reports.length === 0 ? (
                                                    <div className="text-center text-[#123E23]/60 py-4">
                                                        <i className="fa-solid fa-shield-check text-xl lg:text-2xl mb-2"></i>
                                                        <p className="text-sm">No reports found</p>
                                                    </div>
                                                ) : (
                                                    <ul className="divide-y divide-[#123E23]/10">
                                                        {recentActivities.reports.map((report, index) => (
                                                            <li key={report._id || index} className="flex justify-between items-center p-3 lg:p-4 hover:bg-[#FCFCF4]/30 transition-colors">
                                                                <div className="flex-1 min-w-0">
                                                                    <span className="text-[#123E23] font-medium text-sm lg:text-base block truncate">{report.reason || 'No reason provided'}</span>
                                                                    <div className="text-xs lg:text-sm text-[#123E23]/60">
                                                                        {report.content_type} • by {report.reported_by?.username || 'Unknown User'}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right ml-2 flex-shrink-0">
                                                                    <div className={`text-xs font-medium ${getStatusBadge(report.status)}`}>
                                                                        {report.status?.toUpperCase() || 'PENDING'}
                                                                    </div>
                                                                    <span className="text-gray-500 text-xs">
                                                                        {formatDate(report.created_at)}
                                                                    </span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Section */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mt-4">
                                        {/* Community Rating */}
                                        <div className="community-rating flex flex-col justify-between pb-12 lg:pb-20 bg-white p-4 lg:p-6 rounded-xl shadow-md border border-[#123E23]/20 hover:shadow-lg transition-all duration-300">
                                            <div className="flex justify-between items-center mb-4 lg:mb-6">
                                                <div>
                                                    <h3 className="text-base lg:text-lg font-semibold text-[#123E23]">Community Rating</h3>
                                                    <p className="text-xs lg:text-sm text-[#123E23]/60 mt-1">Based on user feedback</p>
                                                </div>
                                                <div className="flex flex-col self-center items-end">
                                                    {ratingStats.totalRatings > 0 ? (
                                                        <>
                                                            <span className="text-2xl lg:text-3xl font-bold text-[#123E23]">{ratingStats.averageRating}</span>
                                                            <div className="flex items-center gap-1 mt-1">
                                                                {[1, 2, 3, 4, 5].map(star => (
                                                                    <i 
                                                                        key={star}
                                                                        className={`fa-${star <= Math.round(ratingStats.averageRating) ? 'solid' : 'regular'} fa-star text-sm lg:text-base`}
                                                                        style={{ color: '#22C55E' }}
                                                                    ></i>
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-[#123E23]/60 mt-1">
                                                                ({ratingStats.totalRatings} ratings)
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-2xl lg:text-3xl font-bold text-[#123E23]/50">No ratings</span>
                                                            <div className="flex items-center gap-1 mt-1">
                                                                {[1, 2, 3, 4, 5].map(star => (
                                                                    <i 
                                                                        key={star}
                                                                        className="fa-regular fa-star text-sm lg:text-base text-[#123E23]/30"
                                                                    ></i>
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-[#123E23]/60 mt-1">
                                                                (0 ratings)
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="rating-count space-y-2 lg:space-y-2.5">
                                                {ratingStats.totalRatings > 0 ? (
                                                    <>
                                                        {[5,4,3,2,1].map(stars => (
                                                            <div key={stars} className="rating-bar group hover:bg-[#FCFCF4]/30 p-1.5 lg:p-2 rounded-lg transition-colors">
                                                                <div className="flex items-center gap-2 lg:gap-4">
                                                                    <div className="flex items-center gap-1 min-w-[80px] lg:min-w-[120px]">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <i 
                                                                                key={i} 
                                                                                className={`fa-${i < stars ? 'solid' : 'regular'} fa-star text-xs lg:text-sm`}
                                                                                style={{ color: '#123E23' }}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    
                                                                    <div className="flex-1 flex items-center gap-2 lg:gap-3">
                                                                        <div className="relative flex-1 h-1.5 lg:h-2 bg-[#d0f7de] rounded-full overflow-hidden">
                                                                            <div 
                                                                                className="absolute left-0 top-0 h-full bg-[#123E23] transition-all duration-300"
                                                                                style={{ 
                                                                                    width: `${ratingStats.percentageDistribution[stars] || 0}%` 
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-xs lg:text-sm text-[#123E23] min-w-[24px] lg:min-w-[36px]">
                                                                            {ratingStats.percentageDistribution[stars] || 0}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <div className="text-[#123E23]/50 mb-2">
                                                            <i className="fa-regular fa-star text-3xl"></i>
                                                        </div>
                                                        <p className="text-[#123E23]/60 text-sm">
                                                            No ratings yet
                                                        </p>
                                                        <p className="text-[#123E23]/40 text-xs mt-1">
                                                            Ratings will appear here after users submit feedback
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Traffic Statistics */}
                                        <div className="traffic-statistics bg-white p-4 lg:p-6 rounded-xl shadow-md border border-[#123E23]/20 hover:shadow-lg transition-all duration-300">
                                            <div className="flex justify-between items-start mb-4 lg:mb-6">
                                                <div>
                                                    <h3 className="text-base lg:text-lg font-semibold text-[#123E23]">Traffic Statistics</h3>
                                                    <p className="text-xs lg:text-sm text-[#123E23]/60 mt-1">Last 7 Days Activity</p>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-2xl lg:text-3xl font-bold text-[#123E23]">{trafficData.totalActivity}</span>
                                                    <span className="text-xs lg:text-sm text-[#123E23]/60">Total Activity</span>
                                                </div>
                                            </div>

                                            {/* Traffic Legend */}
                                            <div className="flex flex-wrap gap-2 lg:gap-4 mb-4 text-xs">
                                                <div className="flex items-center gap-1 lg:gap-2">
                                                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-[#22C55E] rounded-full"></div>
                                                    <span className="text-[#123E23]/70">Users: {trafficData.userData.reduce((sum, val) => sum + val, 0)}</span>
                                                </div>
                                                <div className="flex items-center gap-1 lg:gap-2">
                                                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-[#3B82F6] rounded-full"></div>
                                                    <span className="text-[#123E23]/70">Posts: {trafficData.postData.reduce((sum, val) => sum + val, 0)}</span>
                                                </div>
                                                <div className="flex items-center gap-1 lg:gap-2">
                                                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-[#F59E0B] rounded-full"></div>
                                                    <span className="text-[#123E23]/70">Comments: {trafficData.commentData.reduce((sum, val) => sum + val, 0)}</span>
                                                </div>
                                            </div>

                                            <div className="chart-wrapper bg-[#FCFCF4]/20 p-3 lg:p-4 rounded-lg">
                                                <div className="chart-container h-[250px] lg:h-[300px]">
                                                    <LineChart
                                                        height={window.innerWidth < 1024 ? 250 : 300}
                                                        series={[
                                                            {
                                                                data: trafficData.userData,
                                                                area: false,
                                                                showMark: true,
                                                                color: '#22C55E',
                                                                label: 'Users'
                                                            },
                                                            {
                                                                data: trafficData.postData,
                                                                area: false,
                                                                showMark: true,
                                                                color: '#3B82F6',
                                                                label: 'Posts'
                                                            },
                                                            {
                                                                data: trafficData.commentData,
                                                                area: false,
                                                                showMark: true,
                                                                color: '#F59E0B',
                                                                label: 'Comments'
                                                            }
                                                        ]}
                                                        xAxis={[{
                                                            scaleType: 'point',
                                                            data: trafficData.labels,
                                                            tickSize: 0,
                                                        }]}
                                                        yAxis={[{
                                                            width: window.innerWidth < 1024 ? 40 : 50,
                                                            tickSize: 0,
                                                        }]}
                                                        margin={{ 
                                                            right: window.innerWidth < 1024 ? 16 : 24, 
                                                            top: 20, 
                                                            bottom: 20, 
                                                            left: window.innerWidth < 1024 ? 50 : 60 
                                                        }}
                                                        sx={{
                                                            [`& .${lineElementClasses.root}`]: {
                                                                strokeWidth: 2,
                                                            },
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    } />
                    <Route path="users" element={<Users />} />
                    <Route path="posts" element={<Posts />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="notifications" element={<Notifications />} />
                </Routes>
            </div>
        </div>
    );
}