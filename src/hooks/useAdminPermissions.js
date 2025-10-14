import { useSelector } from 'react-redux';

/**
 * Hook to check admin permissions and current mode
 * @returns {Object} Permission states and helper functions
 */
const useAdminPermissions = () => {
    const user = useSelector(state => state.auth?.user);
    const isAdminMode = useSelector(state => state.auth?.isAdminMode);
    
    // Check if user is admin
    const isAdmin = user?.role === 'admin';
    
    // Check if currently in admin mode (has full admin permissions)
    const hasAdminPermissions = isAdmin && isAdminMode;
    
    // Check if admin is browsing as user (limited permissions)
    const isBrowsingAsUser = isAdmin && !isAdminMode;
    
    // Check if user can access admin features
    const canAccessAdminFeatures = hasAdminPermissions;
    
    // Check if user can perform admin actions (create, edit, delete posts, manage users, etc.)
    const canPerformAdminActions = hasAdminPermissions;
    
    // Check if user should see admin UI elements
    const shouldShowAdminUI = hasAdminPermissions;
    
    // Check if user can moderate content
    const canModerateContent = hasAdminPermissions;
    
    return {
        isAdmin,
        isAdminMode,
        hasAdminPermissions,
        isBrowsingAsUser,
        canAccessAdminFeatures,
        canPerformAdminActions,
        shouldShowAdminUI,
        canModerateContent,
        // Helper methods
        getCurrentMode: () => isAdminMode ? 'admin' : 'user',
        getEffectiveRole: () => hasAdminPermissions ? 'admin' : 'user'
    };
};

export default useAdminPermissions;