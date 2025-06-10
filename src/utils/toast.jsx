import { toast } from 'react-toastify';
import React from 'react'; 

// Base toast configuration
const toastConfig = {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
};

// Success toast (Green)
export const showSuccessToast = (message) => {
    toast.success(message, {
        ...toastConfig,
        className: 'custom-toast-success',
        icon: () => <i className="fa-solid fa-check" style={{ color: '#123E23' }} />,
        style: {
            background: '#F0F4E6',
            color: '#123E23',
            border: '1px solid #123E23',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '500'
        }
    });
};

// Error toast (Red)
export const showErrorToast = (message) => {
    toast.error(message, {
        ...toastConfig,
        className: 'custom-toast-error',
        icon: () => <i className="fa-solid fa-xmark" style={{ color: '#DC2626' }} />,
        style: {
            background: '#FEE2E2',
            color: '#DC2626',
            border: '1px solid #DC2626',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '500'
        }
    });
};

// Info toast (Blue)
export const showInfoToast = (message) => {
    toast.info(message, {
        ...toastConfig,
        className: 'custom-toast-info',
        icon: () => <i className="fa-solid fa-bell" style={{ color: '#1D4ED8' }} />,
        style: {
            background: '#DBEAFE',
            color: '#1D4ED8',
            border: '1px solid #1D4ED8',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '500'
        }
    });
};