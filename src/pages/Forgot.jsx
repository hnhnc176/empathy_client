import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../style'
import { ChevronLeft, Check } from 'lucide-react'
import axiosInstance from '../config/axios'
import { showSuccessToast, showErrorToast } from '../utils/toast'

// Enhanced Input Component with Floating Labels and Micro-interactions
const EnhancedInput = ({ 
    type = 'text', 
    name, 
    value, 
    onChange, 
    placeholder, 
    error, 
    disabled = false, 
    required = false,
    minLength,
    className = '',
    showPasswordStrength = false
}) => {
    const [isFocused, setIsFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const hasValue = value && value.length > 0
    const isFloating = isFocused || hasValue
    
    // Password strength calculation
    const getPasswordStrength = (password) => {
        if (!password) return { score: 0, label: '', color: '' }
        
        let score = 0
        if (password.length >= 8) score++
        if (/[a-z]/.test(password)) score++
        if (/[A-Z]/.test(password)) score++
        if (/\d/.test(password)) score++
        if (/[^\w\s]/.test(password)) score++
        
        const strength = {
            0: { label: '', color: '' },
            1: { label: 'Very Weak', color: 'bg-red-500' },
            2: { label: 'Weak', color: 'bg-orange-500' },
            3: { label: 'Fair', color: 'bg-yellow-500' },
            4: { label: 'Good', color: 'bg-blue-500' },
            5: { label: 'Strong', color: 'bg-green-500' }
        }
        
        return { score, ...strength[score] }
    }
    
    const passwordStrength = showPasswordStrength ? getPasswordStrength(value) : null
    
    return (
        <div className={`relative w-full ${className}`}>
            <div className="relative">
                <input
                    type={type === 'password' && showPassword ? 'text' : type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={disabled}
                    required={required}
                    minLength={minLength}
                    className={`
                        w-full h-[48px] border rounded-md px-3 pt-6 pb-2 text-[14px] bg-white
                        transition-all duration-300 ease-in-out transform
                        focus:outline-none focus:ring-2 focus:ring-[#123E23]/20 focus:border-[#123E23]
                        hover:border-[#123E23]/60 hover:shadow-sm
                        ${
                            error 
                                ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                                : 'border-[#123E23]'
                        }
                        ${
                            disabled 
                                ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                                : 'hover:scale-[1.01] focus:scale-[1.01]'
                        }
                    `}
                    placeholder={isFloating ? '' : placeholder}
                />
                
                {/* Floating Label */}
                <label 
                    className={`
                        absolute left-3 transition-all duration-300 ease-in-out pointer-events-none
                        ${
                            isFloating 
                                ? 'top-1 text-xs text-[#123E23] font-medium transform scale-90' 
                                : 'top-1/2 -translate-y-1/2 text-[14px] text-gray-500'
                        }
                        ${
                            error && isFloating 
                                ? 'text-red-500' 
                                : ''
                        }
                    `}
                >
                    {placeholder}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {/* Password Toggle */}
                {type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#123E23] transition-colors duration-200"
                        tabIndex={-1}
                    >
                        {showPassword ? '🙈' : '👁️'}
                    </button>
                )}
                
                {/* Success Checkmark */}
                {value && !error && type !== 'password' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 animate-bounce">
                        <Check size={16} />
                    </div>
                )}
            </div>
            
            {/* Password Strength Indicator */}
            {showPasswordStrength && value && (
                <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <div 
                                key={level}
                                className={`
                                    h-1 flex-1 rounded-full transition-all duration-300 
                                    ${
                                        level <= passwordStrength.score 
                                            ? passwordStrength.color 
                                            : 'bg-gray-200'
                                    }
                                `}
                            />
                        ))}
                    </div>
                    {passwordStrength.label && (
                        <p className={`text-xs ${
                            passwordStrength.score >= 4 ? 'text-green-600' : 
                            passwordStrength.score >= 3 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                            Password strength: {passwordStrength.label}
                        </p>
                    )}
                </div>
            )}
            
            {/* Error Message with Animation */}
            {error && (
                <p className="error-text text-red-500 text-sm mt-1 animate-shake">
                    {error}
                </p>
            )}
            
            {/* Focus Ring Animation */}
            {isFocused && (
                <div className="absolute inset-0 rounded-md border-2 border-[#123E23] opacity-20 animate-pulse pointer-events-none" />
            )}
        </div>
    )
}

// Enhanced Stepper Component with Advanced Animations
const Stepper = ({ currentStep, steps, className = "" }) => {
    return (
        <div className={`stepper-container w-full max-w-md mx-auto mb-8 ${className}`}>
            <div className="flex items-center justify-between relative">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;
                    const isLast = index === steps.length - 1;
                    
                    return (
                        <React.Fragment key={index}>
                            {/* Step Circle with Enhanced Animations */}
                            <div className="flex flex-col items-center relative z-10">
                                <div className="relative">
                                    {/* Pulse Animation for Active Step */}
                                    {isActive && (
                                        <div className="absolute inset-0 w-10 h-10 rounded-full bg-[#123E23] animate-ping opacity-20"></div>
                                    )}
                                    
                                    {/* Glow Effect for Completed Steps */}
                                    {isCompleted && (
                                        <div className="absolute inset-0 w-10 h-10 rounded-full bg-[#17B367] blur-sm opacity-30 animate-pulse"></div>
                                    )}
                                    
                                    <div 
                                        className={`
                                            relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold 
                                            transition-all duration-500 ease-in-out transform hover:scale-110
                                            ${
                                                isCompleted 
                                                    ? 'bg-[#17B367] shadow-lg shadow-[#17B367]/30 animate-bounce' 
                                                    : isActive 
                                                        ? 'bg-[#123E23] shadow-lg ring-4 ring-[#123E23]/20 animate-pulse' 
                                                        : 'bg-gray-200 hover:bg-gray-300'
                                            }
                                        `}
                                        style={{
                                            animationDuration: isCompleted ? '2s' : isActive ? '1.5s' : 'none',
                                            animationIterationCount: isCompleted ? '1' : 'infinite',
                                            color: isCompleted || isActive ? '#FFFFFF' : '#6B7280'
                                        }}
                                    >
                                        {isCompleted ? (
                                            <Check 
                                                size={16} 
                                                style={{ 
                                                    color: '#FFFFFF',
                                                    animationDelay: '0.3s', 
                                                    animationDuration: '0.6s' 
                                                }}
                                                className="animate-bounce" 
                                            />
                                        ) : (
                                            <span 
                                                className={isActive ? 'animate-pulse' : ''}
                                                style={{ 
                                                    color: isActive ? '#FFFFFF' : '#6B7280',
                                                    fontWeight: '600',
                                                    fontSize: '14px',
                                                    textShadow: isActive ? '0 0 2px rgba(0,0,0,0.3)' : 'none',
                                                    display: 'block',
                                                    lineHeight: '1'
                                                }}
                                            >
                                                {stepNumber}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <span 
                                    className={`
                                        mt-2 text-xs font-medium text-center max-w-[80px] leading-tight
                                        transition-all duration-300 transform
                                        ${
                                            isActive || isCompleted 
                                                ? 'text-[#123E23] scale-105 font-semibold' 
                                                : 'text-gray-400 scale-100'
                                        }
                                    `}
                                >
                                    {step.title}
                                </span>
                            </div>
                            
                            {/* Enhanced Connector Line with Progress Animation */}
                            {!isLast && (
                                <div className="flex-1 mx-2 relative">
                                    {/* Background Line */}
                                    <div className="h-0.5 bg-gray-200 rounded-full"></div>
                                    
                                    {/* Progress Line with Animation */}
                                    <div 
                                        className={`
                                            absolute top-0 left-0 h-0.5 rounded-full transition-all duration-700 ease-in-out
                                            ${
                                                stepNumber < currentStep 
                                                    ? 'bg-gradient-to-r from-[#17B367] to-[#17B367] w-full shadow-sm' 
                                                    : stepNumber === currentStep
                                                        ? 'bg-gradient-to-r from-[#123E23] to-transparent w-1/2 animate-pulse'
                                                        : 'w-0'
                                            }
                                        `}
                                        style={{
                                            boxShadow: stepNumber < currentStep ? '0 0 8px rgba(23, 179, 103, 0.3)' : 'none'
                                        }}
                                    ></div>
                                    
                                    {/* Shimmer Effect for Active Progress */}
                                    {stepNumber === currentStep && (
                                        <div className="absolute top-0 left-0 h-0.5 w-1/2 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-ping"></div>
                                    )}
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            
            {/* Progress Percentage Indicator */}
            <div className="mt-4 text-center">
                <div className="text-xs text-gray-500 font-medium">
                    Step {currentStep} of {steps.length}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div 
                        className="bg-gradient-to-r from-[#123E23] to-[#17B367] h-1 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${(currentStep / steps.length) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default function Forgot() {
    const [currentForm, setCurrentForm] = useState('form-a')
    const navigate = useNavigate()

    // Add form state management
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    })

    // Add validation and loading states
    const [isValid, setIsValid] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [isOtpSent, setIsOtpSent] = useState(false)
    const [isPasswordReset, setIsPasswordReset] = useState(false)
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)

    // Stepper configuration
    const steps = [
        { title: 'Email' },
        { title: 'Verify' },
        { title: 'Reset' },
        { title: 'Success' }
    ]

    // Get current step based on form state
    const getCurrentStep = () => {
        switch (currentForm) {
            case 'form-a': return 1
            case 'form-b': return 2
            case 'form-c': return 3
            case 'form-d': return 4
            default: return 1
        }
    }

    // Enhanced input change handler with real-time validation
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        
        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
        
        // Real-time validation feedback
        if (name === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(value)) {
                setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }))
            }
        }
        
        if (name === 'newPassword' && value) {
            // Only show error if user has finished typing (more than 3 characters)
            if (value.length > 3) {
                if (value.length < 8) {
                    setErrors(prev => ({ ...prev, newPassword: 'Password must be at least 8 characters' }))
                } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                    setErrors(prev => ({ ...prev, newPassword: 'Password must contain uppercase, lowercase, and number' }))
                } else {
                    // Clear error when password meets requirements
                    setErrors(prev => ({ ...prev, newPassword: '' }))
                }
            }
        }
        
        if (name === 'confirmPassword' && value && formData.newPassword) {
            if (value !== formData.newPassword) {
                setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
            } else {
                // Clear error when passwords match
                setErrors(prev => ({ ...prev, confirmPassword: '' }))
            }
        }
    }

    // Validate forms
    useEffect(() => {
        switch (currentForm) {
            case 'form-a':
                setIsValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                break
            case 'form-b':
                // Validate 6-digit OTP
                setIsValid(/^\d{6}$/.test(formData.otp))
                break
            case 'form-c':
                const hasMinLength = formData.newPassword && formData.newPassword.length >= 8;
                const hasLowercase = formData.newPassword && /[a-z]/.test(formData.newPassword);
                const hasUppercase = formData.newPassword && /[A-Z]/.test(formData.newPassword);
                const hasNumber = formData.newPassword && /\d/.test(formData.newPassword);
                const passwordsMatch = formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword;
                
                setIsValid(
                    hasMinLength && 
                    hasLowercase && 
                    hasUppercase && 
                    hasNumber && 
                    passwordsMatch
                )
                break
            default:
                setIsValid(true)
        }
    }, [formData, currentForm])

    const handleSubmit = async (e, formType) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            if (formType === 'form-a') {
                // Form A - Send OTP for password reset (only needs email)
                const { email } = formData;

                if (!email) {
                    setErrors({ email: 'Email is required' });
                    setIsLoading(false);
                    return;
                }

                console.log('Requesting password reset OTP for:', email);
                
                // Call forgot-password endpoint
                const response = await axiosInstance.post('/api/users/forgot-password', {
                    email: email.trim().toLowerCase()
                });

                if (response.data.status === 'success') {
                    showSuccessToast('Password reset OTP sent to your email');
                    setCurrentForm('form-b'); // Move to OTP verification step
                }
            } 
            else if (formType === 'form-b') {
                // Form B - Verify OTP (just validate, don't submit yet)
                const { email, otp } = formData;

                if (!email || !otp) {
                    setErrors({ 
                        email: !email ? 'Email is required' : '',
                        otp: !otp ? 'OTP is required' : ''
                    });
                    setIsLoading(false);
                    return;
                }

                // Just move to password form - we'll verify OTP when resetting password
                setCurrentForm('form-c'); // Move to password reset step
            }
            else if (formType === 'form-c') {
                // Form C - Reset Password with OTP verification
                const { email, otp, newPassword, confirmPassword } = formData;

                if (!newPassword || !confirmPassword) {
                    setErrors({
                        newPassword: !newPassword ? 'New password is required' : '',
                        confirmPassword: !confirmPassword ? 'Please confirm your password' : ''
                    });
                    setIsLoading(false);
                    return;
                }

                if (newPassword !== confirmPassword) {
                    setErrors({ confirmPassword: 'Passwords do not match' });
                    setIsLoading(false);
                    return;
                }

                // Verify OTP and reset password in one call
                const response = await axiosInstance.post('/api/users/verify-reset-otp', {
                    email: email.trim().toLowerCase(),
                    otp: otp,
                    new_password: newPassword
                });

                if (response.data.status === 'success') {
                    showSuccessToast('Password reset successfully!');
                    setCurrentForm('form-d'); // Move to success step
                }
            }
            else if (formType === 'form-d') {
                // Form D - Back to login
                navigate('/signin');
            }

        } catch (error) {
            console.error('Form submission error:', error);
            const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
            
            if (formType === 'form-a') {
                setErrors({ email: errorMessage });
            } else if (formType === 'form-b') {
                setErrors({ otp: errorMessage });
            } else if (formType === 'form-c') {
                setErrors({ newPassword: errorMessage });
            }
            
            showErrorToast(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    const handleResendOTP = async () => {
        setIsLoading(true);
        try {
            // Use forgot-password endpoint for resending
            const response = await axiosInstance.post('/api/users/forgot-password', {
                email: formData.email.trim().toLowerCase()
            });
            
            if (response.data?.status === 'success') {
                showSuccessToast('New OTP sent to your email!');
                console.log('New OTP sent successfully');
            }
        } catch (error) {
            showErrorToast('Failed to send new OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    // Set style submit button when fill all in form
    const submitButtonDisabledStyle = {
        backgroundColor: '#EAEAEA',
        color: '#808080',
        cursor: 'not-allowed',
        width: '100%',
        height: '52px',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: 600,
        padding: '5px 10px',
        border: 'none'
    }
    const submitButtonStyleActive = {
        backgroundColor: '#123E23',
        color: '#FFFFFF',
        cursor: 'pointer',
        width: '100%',
        height: '52px',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: 600,
        padding: '5px 10px',
        border: 'none'
    }

    // Set style for input
    const inputStyle = {
        width: '300px',
        height: '50px',
        border: '1px solid #123E23',
        borderRadius: '6px',
        textAlign: 'center',
        padding: '5px 10px',
        fontSize: '14px',
        backgroundColor: '#FFFFFF',
        selfAlign: 'center'
    }

    const inputErrorStyle = {
        ...inputStyle,
        border: '1px solid #EF4444'
    }

    const formStyle = {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '35px'
    }

    return (
        <section className="forgot-password flex bg-[#FCFCF4] flex-col items-center justify-center w-full min-h-screen lg:h-screen bg-[url('src/assets/shape-bg.png')] bg-cover bg-no-repeat p-4 lg:p-0 page-enter">
            <ChevronLeft 
                className="back-button absolute top-3 left-3 lg:top-5 lg:left-5 text-[#123E23] cursor-pointer z-10 hover:scale-110 transition-transform duration-300" 
                size={24} 
                onClick={() => navigate("/signin")} 
            />
            
            {/* Mobile Layout */}
            <div className="body-content lg:hidden flex flex-col items-center justify-start w-full min-h-screen py-16 px-4 overflow-y-auto slide-in-bottom">
                {/* Stepper Component for Mobile */}
                <div className="w-full mb-6 scale-in">
                    <Stepper currentStep={getCurrentStep()} steps={steps} />
                </div>
                
                <h1 className="title text-[24px] font-bold text-[#123E23] mb-[20px] text-center slide-in-left" style={{ fontFamily: styles.font.body }}>
                    Forgot Password
                </h1>

                {/* Mobile Form A - Email Input */}
                <form
                    className={`form ${currentForm === 'form-a' ? 'flex' : 'hidden'} flex-col items-center justify-center gap-6 w-full max-w-sm slide-in-right`}
                    onSubmit={(e) => handleSubmit(e, 'form-a')}
                >
                    <p className="subtitle text-[14px] font-normal text-[#123E23] text-center">
                        Enter your registered email
                    </p>
                    <div className="input-group w-full">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="email w-full h-[48px] border border-[#123E23] rounded-md text-center px-3 text-[14px] bg-white transition-all duration-300 hover:border-[#17B367] focus:border-[#17B367] focus:outline-none hover:scale-[1.02]"
                            style={errors.email ? { borderColor: '#EF4444' } : {}}
                            placeholder="Mymail@example.com"
                            required
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <p className="error-text text-red-500 text-sm mt-1 text-center">{errors.email}</p>
                        )}
                    </div>
                    <button
                        style={{
                            backgroundColor: isValid && !isLoading ? '#123E23' : '#EAEAEA',
                            color: isValid && !isLoading ? '#FFFFFF' : '#808080',
                            cursor: isValid && !isLoading ? 'pointer' : 'not-allowed',
                            width: '100%',
                            height: '48px',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: 600,
                            border: 'none'
                        }}
                        type="submit"
                        className="submit"
                        disabled={!isValid || isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Sending...
                            </span>
                        ) : (
                            'Send OTP'
                        )}
                    </button>
                </form>

                {/* Mobile Form B - OTP Input */}
                <form
                    className={`form ${currentForm === 'form-b' ? 'flex' : 'hidden'} flex-col items-center justify-center gap-6 w-full max-w-sm`}
                    onSubmit={(e) => handleSubmit(e, 'form-b')}
                >
                    <p className="subtitle text-[14px] font-normal text-[#123E23] text-center">
                        Enter the 6-digit OTP from your email
                    </p>
                    <div className="text-center mb-4">
                        <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            📧 Check your email for the 6-digit OTP
                        </p>
                    </div>
                    <div className="input-group w-full">
                        <input
                            type="text"
                            name="otp"
                            value={formData.otp}
                            onChange={handleInputChange}
                            className="otp w-full h-[48px] border border-[#123E23] rounded-md text-center px-3 text-[14px] bg-white"
                            style={errors.otp ? { borderColor: '#EF4444' } : {}}
                            placeholder="000000"
                            maxLength="6"
                            pattern="\d{6}"
                            required
                            disabled={isLoading}
                        />
                        {errors.otp && (
                            <p className="error-text text-red-500 text-sm mt-1 text-center">{errors.otp}</p>
                        )}
                    </div>
                    <p className="resend-code text-center text-sm">
                        Didn't receive an OTP?
                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={isLoading}
                            className="resend-code-a text-[#123E23] no-underline font-semibold cursor-pointer ml-1 hover:opacity-80"
                        >
                            {isLoading ? 'Sending...' : 'Resend OTP'}
                        </button>
                    </p>
                    <button
                        style={{
                            backgroundColor: isValid && !isLoading ? '#123E23' : '#EAEAEA',
                            color: isValid && !isLoading ? '#FFFFFF' : '#808080',
                            cursor: isValid && !isLoading ? 'pointer' : 'not-allowed',
                            width: '100%',
                            height: '48px',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: 600,
                            border: 'none'
                        }}
                        type="submit"
                        className="submit"
                        disabled={!isValid || isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Verifying...
                            </span>
                        ) : (
                            'Verify OTP'
                        )}
                    </button>
                </form>

                {/* Mobile Form C - New Password */}
                <form
                    className={`form ${currentForm === 'form-c' ? 'flex' : 'hidden'} flex-col items-center justify-center gap-6 w-full max-w-sm slide-in-right`}
                    onSubmit={(e) => handleSubmit(e, 'form-c')}
                >
                    <p className="subtitle text-[14px] font-normal text-[#123E23] text-center">
                        Enter new password
                    </p>
                    
                    <div className="input-group w-full relative">
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            onFocus={() => setShowPasswordRequirements(true)}
                            onBlur={() => setShowPasswordRequirements(false)}
                            className="password w-full h-[48px] border border-[#123E23] rounded-md text-center px-3 text-[14px] bg-white transition-all duration-300 hover:border-[#17B367] focus:border-[#17B367] focus:outline-none hover:scale-[1.02]"
                            style={errors.newPassword ? { borderColor: '#EF4444' } : {}}
                            placeholder="New Password"
                            required
                            disabled={isLoading}
                            minLength="8"
                            autoComplete="new-password"
                            title=""
                        />
                        
                        {/* Password Requirements Popup - Mobile (Right Side) */}
                        {showPasswordRequirements && (
                            <div className="password-requirements absolute top-0 right-0 transform translate-x-full ml-2 w-64 bg-white border border-blue-200 rounded-md p-3 shadow-lg z-50 slide-in-right">
                                <h4 className="text-sm font-semibold text-blue-800 mb-2">Password Requirements:</h4>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li className={`flex items-center gap-2 ${formData.newPassword && formData.newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                                        <span className={`w-2 h-2 rounded-full ${formData.newPassword && formData.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                        At least 8 characters
                                    </li>
                                    <li className={`flex items-center gap-2 ${formData.newPassword && /[a-z]/.test(formData.newPassword) ? 'text-green-600' : ''}`}>
                                        <span className={`w-2 h-2 rounded-full ${formData.newPassword && /[a-z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                        One lowercase letter
                                    </li>
                                    <li className={`flex items-center gap-2 ${formData.newPassword && /[A-Z]/.test(formData.newPassword) ? 'text-green-600' : ''}`}>
                                        <span className={`w-2 h-2 rounded-full ${formData.newPassword && /[A-Z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                        One uppercase letter
                                    </li>
                                    <li className={`flex items-center gap-2 ${formData.newPassword && /\d/.test(formData.newPassword) ? 'text-green-600' : ''}`}>
                                        <span className={`w-2 h-2 rounded-full ${formData.newPassword && /\d/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                        One number
                                    </li>
                                </ul>
                            </div>
                        )}
                        
                        {errors.newPassword && (
                            <p className="error-text text-red-500 text-sm mt-1 text-center">{errors.newPassword}</p>
                        )}
                    </div>
                    
                    <div className="input-group w-full">
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="password w-full h-[48px] border border-[#123E23] rounded-md text-center px-3 text-[14px] bg-white transition-all duration-300 hover:border-[#17B367] focus:border-[#17B367] focus:outline-none hover:scale-[1.02]"
                            style={errors.confirmPassword ? { borderColor: '#EF4444' } : {}}
                            placeholder="Confirm Password"
                            required
                            disabled={isLoading}
                        />
                        {errors.confirmPassword && (
                            <p className="error-text text-red-500 text-sm mt-1 text-center">{errors.confirmPassword}</p>
                        )}
                    </div>
                    
                    {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                        <div className="w-full text-center">
                            <p className="error-text text-red-500 text-sm">Passwords do not match</p>
                        </div>
                    )}
                    
                    <button
                        style={{
                            backgroundColor: isValid && !isLoading ? '#123E23' : '#EAEAEA',
                            color: isValid && !isLoading ? '#FFFFFF' : '#808080',
                            cursor: isValid && !isLoading ? 'pointer' : 'not-allowed',
                            width: '100%',
                            height: '48px',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: 600,
                            border: 'none'
                        }}
                        type="submit"
                        className="submit transition-all duration-300 hover:scale-105 active:scale-95"
                        disabled={!isValid || isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Resetting...
                            </span>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>

                {/* Mobile Form D - Success */}
                <div className={`form ${currentForm === 'form-d' ? 'flex' : 'hidden'} flex-col items-center justify-center gap-6 w-full max-w-sm`}>
                    <p className="subtitle-ok text-[24px] font-bold text-[#17B367] text-center">
                        Success!
                    </p>
                    <img src="src/assets/cta.png" alt="success" className="ok-img w-[250px] h-[200px] object-contain" />
                    <p className="text-center text-[#123E23] text-sm">
                        Your password has been reset successfully!
                    </p>
                    <button
                        onClick={(e) => handleSubmit(e, 'form-d')}
                        className="ok-back btn flex items-center w-fit h-[54px] justify-center bg-[#123E23] !text-[#F0F4E6] rounded-[6px] font-semibold !text-[16px] hover:opacity-90 transition-opacity"
                    >
                        Back to Login Page
                    </button>
                </div>
            </div>

            {/* Desktop Layout - Unchanged */}
            <div className="body-content hidden lg:flex flex-col items-center justify-center w-full slide-in-bottom">
                {/* Stepper Component */}
                <div className="scale-in">
                    <Stepper currentStep={getCurrentStep()} steps={steps} />
                </div>
                
                <h1 className="title text-[30px] font-bold text-[#123E23] mb-[20px] slide-in-left" style={{ fontFamily: styles.font.body }}>
                    Forgot Password
                </h1>

                {/* Form A - Email Input */}
                <form
                    className={`form ${currentForm === 'form-a' ? 'flex' : 'hidden'}`}
                    onSubmit={(e) => handleSubmit(e, 'form-a')}
                    style={formStyle}
                >
                    <p className="subtitle text-[16px] font-normal text-[#123E23] mb-[10px]">
                        Enter your registered email
                    </p>
                    <div className="input-group">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="email"
                            style={errors.email ? inputErrorStyle : inputStyle}
                            placeholder="Mymail@example.com"
                            required
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <p className="error-text text-red-500 text-sm mt-1 text-center">{errors.email}</p>
                        )}
                    </div>
                    <button
                        style={isValid && !isLoading ? submitButtonStyleActive : submitButtonDisabledStyle}
                        type="submit"
                        className="submit"
                        disabled={!isValid || isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Sending...
                            </span>
                        ) : (
                            'Send OTP'
                        )}
                    </button>
                </form>

                {/* Form B - OTP Input */}
                <form
                    className={`form ${currentForm === 'form-b' ? 'flex' : 'hidden'}`}
                    onSubmit={(e) => handleSubmit(e, 'form-b')}
                    style={formStyle}
                >
                    <p className="subtitle text-[16px] font-normal text-[#123E23] mb-[10px]">
                        Enter the 6-digit OTP from your email
                    </p>
                    <div className="text-center mb-4">
                        <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            📧 Check your email for the 6-digit OTP
                        </p>
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            name="otp"
                            value={formData.otp}
                            onChange={handleInputChange}
                            className="otp"
                            style={errors.otp ? inputErrorStyle : inputStyle}
                            placeholder="000000"
                            maxLength="6"
                            pattern="\d{6}"
                            required
                            disabled={isLoading}
                        />
                        {errors.otp && (
                            <p className="error-text text-red-500 text-sm mt-1 text-center">{errors.otp}</p>
                        )}
                    </div>
                    <p className="resend-code text-center">
                        Didn't receive an OTP?
                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={isLoading}
                            className="resend-code-a text-[#123E23] no-underline font-semibold cursor-pointer ml-1 hover:opacity-80"
                        >
                            {isLoading ? 'Sending...' : 'Resend OTP'}
                        </button>
                    </p>
                    <button
                        style={isValid && !isLoading ? submitButtonStyleActive : submitButtonDisabledStyle}
                        type="submit"
                        className="submit"
                        disabled={!isValid || isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Verifying...
                            </span>
                        ) : (
                            'Verify OTP'
                        )}
                    </button>
                </form>

                {/* Form C - New Password */}
                <form
                    className={`form ${currentForm === 'form-c' ? 'flex' : 'hidden'} slide-in-right`}
                    onSubmit={(e) => handleSubmit(e, 'form-c')}
                    style={formStyle}
                >
                    <p className="subtitle text-[16px] font-normal text-[#123E23] mb-[10px]">
                        Enter new password
                    </p>
                    
                    <div className="input-group relative">
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            onFocus={() => setShowPasswordRequirements(true)}
                            onBlur={() => setShowPasswordRequirements(false)}
                            className="password"
                            style={errors.newPassword ? inputErrorStyle : inputStyle}
                            placeholder="New Password"
                            required
                            disabled={isLoading}
                            minLength="8"
                            autoComplete="new-password"
                            title=""
                        />
                        
                        {/* Password Requirements Popup - Desktop (Right Side) */}
                        {showPasswordRequirements && (
                            <div className="password-requirements absolute top-0 left-full ml-4 bg-white border border-blue-200 rounded-md p-4 shadow-lg z-50 scale-in" style={{ width: '280px' }}>
                                <h4 className="text-sm font-semibold text-blue-800 mb-3">Password Requirements:</h4>
                                <ul className="text-xs text-blue-700 space-y-2">
                                    <li className={`flex items-center gap-2 ${formData.newPassword && formData.newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                                        <span className={`w-2 h-2 rounded-full ${formData.newPassword && formData.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                        At least 8 characters
                                    </li>
                                    <li className={`flex items-center gap-2 ${formData.newPassword && /[a-z]/.test(formData.newPassword) ? 'text-green-600' : ''}`}>
                                        <span className={`w-2 h-2 rounded-full ${formData.newPassword && /[a-z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                        One lowercase letter
                                    </li>
                                    <li className={`flex items-center gap-2 ${formData.newPassword && /[A-Z]/.test(formData.newPassword) ? 'text-green-600' : ''}`}>
                                        <span className={`w-2 h-2 rounded-full ${formData.newPassword && /[A-Z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                        One uppercase letter
                                    </li>
                                    <li className={`flex items-center gap-2 ${formData.newPassword && /\d/.test(formData.newPassword) ? 'text-green-600' : ''}`}>
                                        <span className={`w-2 h-2 rounded-full ${formData.newPassword && /\d/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                        One number
                                    </li>
                                </ul>
                            </div>
                        )}
                        
                        {errors.newPassword && (
                            <p className="error-text text-red-500 text-sm mt-1 text-center">{errors.newPassword}</p>
                        )}
                    </div>
                    
                    <div className="input-group">
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="password"
                            style={errors.confirmPassword ? inputErrorStyle : inputStyle}
                            placeholder="Confirm Password"
                            required
                            disabled={isLoading}
                        />
                        {errors.confirmPassword && (
                            <p className="error-text text-red-500 text-sm mt-1 text-center">{errors.confirmPassword}</p>
                        )}
                    </div>
                    
                    {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                        <div className="text-center" style={{ width: '300px' }}>
                            <p className="error-text text-red-500 text-sm">Passwords do not match</p>
                        </div>
                    )}
                    
                    <button
                        style={isValid && !isLoading ? submitButtonStyleActive : submitButtonDisabledStyle}
                        type="submit"
                        className="submit hover:scale-105 transition-transform duration-300"
                        disabled={!isValid || isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Resetting...
                            </span>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>

                {/* Form D - Success */}
                <form style={formStyle} className={`form ${currentForm === 'form-d' ? 'flex' : 'hidden'}`}>
                    <p className="subtitle-ok flex justify-center self-center text-[30px] font-bold !text-[#17B367] mb-[20px]">
                        Success!
                    </p>
                    <img src="src/assets/cta.png" alt="success" className="ok-img w-[507px] h-[417px] mb-[20px]" />
                    <p className="text-center text-[#123E23] mb-4">
                        Your password has been reset successfully!
                    </p>
                    <button
                        onClick={(e) => handleSubmit(e, 'form-d')}
                        className="ok-back btn flex items-center w-[300px] h-[52px] justify-center bg-[#123E23] !text-[#F0F4E6] rounded-[6px] font-semibold text-[16px] hover:opacity-90 transition-opacity"
                    >
                        Back to Login Page
                    </button>
                </form>
            </div>
        </section>
    )
}