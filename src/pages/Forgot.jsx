import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../style'
import { ChevronLeft } from 'lucide-react'

export default function Forgot() {
    const [currentForm, setCurrentForm] = useState('form-a')
    const navigate = useNavigate()

    // Add form state management
    const [formData, setFormData] = useState({
        email: '',
        otp: ['', '', '', '', '', ''],
        newPassword: '',
        confirmPassword: ''
    })

    // Add validation state
    const [isValid, setIsValid] = useState(false)

    // Handle input changes
    const handleInputChange = (e, index) => {
        const { name, value } = e.target

        if (name === 'otp') {
            const newOtp = [...formData.otp]
            newOtp[index] = value
            setFormData(prev => ({
                ...prev,
                otp: newOtp
            }))

            // Auto focus next input
            if (value && index < 5) {
                const nextInput = document.getElementById(`otp${index + 2}`)
                if (nextInput) nextInput.focus()
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    // Validate forms
    useEffect(() => {
        switch (currentForm) {
            case 'form-a':
                setIsValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                break
            case 'form-b':
                setIsValid(formData.otp.every(digit => digit.length === 1))
                break
            case 'form-c':
                setIsValid(
                    formData.newPassword &&
                    formData.confirmPassword &&
                    formData.newPassword === formData.confirmPassword &&
                    formData.newPassword.length >= 6
                )
                break
            default:
                setIsValid(true)
        }
    }, [formData, currentForm])

    const handleSubmit = (event, formId) => {
        event.preventDefault()

        switch (formId) {
            case 'form-a':
                setCurrentForm('form-b')
                break
            case 'form-b':
                setCurrentForm('form-c')
                break
            case 'form-c':
                setCurrentForm('form-d')
                break
            case 'form-d':
                navigate('/signin')
                break
            default:
                break
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

    //set style for input
    const inputStyle = {
        width: '300px',
        height: '50px',
        border: '1px solid #123E23',
        borderRadius: '6px',
        textAlign: 'center',
        padding: '5px 10px',
        fontSize: '14px',
        backgroundColor: '#FFFFFF'
    }

    const otpInputStyle = {
        width: '40px',
        height: '45px',
        borderRadius: '6px',
        border: '1px solid #123E23',
        padding: '5px 10px',
        fontSize: '14px',
        textAlign: 'center',
        backgroundColor: '#FFFFFF'
    }

    const formStyle = {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '35px'
    }

    return (
        <section className="forgot-password flex bg-[#FCFCF4] flex-col items-center justify-center w-full h-screen bg-[url('src/assets/shape-bg.png')] bg-cover bg-no-repeat">
            <ChevronLeft className="back-button absolute top-5 left-5 text-[#123E23] cursor-pointer" size={30} onClick={() => window.location.href = "/home"} />
            <div className="body-content flex flex-col items-center justify-center w-full" >
                <h1 className="title text-[30px] font-bold text-[#123E23] mb-[20px] " style={{ fontFamily: styles.font.body }}>Forgot Password</h1>

                <form
                    className={`form ${currentForm === 'form-a' ? 'flex' : 'hidden'}`}
                    onSubmit={(e) => handleSubmit(e, 'form-a')}
                    style={formStyle}
                >
                    <p className="subtitle text-[16px] font-normal text-[#123E23] mb-[10px]">Enter your registered email</p>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="email"
                        style={inputStyle}
                        placeholder="Mymail@example.com"
                        required
                    />
                    <button
                        style={isValid ? submitButtonStyleActive : submitButtonDisabledStyle}
                        type="submit"
                        className="submit"
                        disabled={!isValid}
                    >
                        Submit
                    </button>
                </form>

                <form
                    className={`form ${currentForm === 'form-b' ? 'flex' : 'hidden'}`}
                    onSubmit={(e) => handleSubmit(e, 'form-b')}
                    style={formStyle}
                >
                    <p className="subtitle">Check your email please </p>
                    <div className="otp-input flex w-[fit-content] gap-[10px] justify-center items-center">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                            <input
                                key={index}
                                style={otpInputStyle}
                                type="text"
                                name="otp"
                                value={formData.otp[index]}
                                onChange={(e) => handleInputChange(e, index)}
                                className="otp"
                                id={`otp${index + 1}`}
                                maxLength="1"
                                required
                            />
                        ))}
                    </div>
                    <p className="resend-code">Didn’t receive a code?<a className="resend-code-a text-[#123E23] no-underline font-semibold cursor-pointer"> Resend</a></p>
                    <button
                        style={isValid ? submitButtonStyleActive : submitButtonDisabledStyle}
                        type="submit"
                        className="submit"
                        disabled={!isValid}
                    >
                        Submit
                    </button>
                </form>

                <form
                    className={`form ${currentForm === 'form-c' ? 'flex' : 'hidden'}`}
                    onSubmit={(e) => handleSubmit(e, 'form-c')}
                    style={formStyle}
                >
                    <p className="subtitle">Enter new password</p>
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="password"
                        style={inputStyle}
                        placeholder="New Password"
                        required
                    />
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="password"
                        style={inputStyle}
                        placeholder="Confirm Password"
                        required
                    />
                    <button
                        style={isValid ? submitButtonStyleActive : submitButtonDisabledStyle}
                        type="submit"
                        className="submit"
                        disabled={!isValid}
                    >
                        Submit
                    </button>
                </form>

                <form style={formStyle} className={`form ${currentForm === 'form-d' ? 'flex' : 'hidden'}`}>
                    <p className="subtitle-ok flex justify-center self-center text-[30px] font-bold !text-[#17B367] mb-[20px]">Success</p>
                    <img src="src/assets/cta.png" alt="success" className="ok-img w-[507px] h-[417px] mb-[20px]" />
                    <button
                        onClick={(e) => handleSubmit(e, 'form-d')}
                        className="ok-back btn flex items-center w-[300px] h-[52px] justify-center bg-[#123E23] !text-[#F0F4E6] rounded-[6px] font-semibold text-[16px]"
                    >
                        Back to Login Page
                    </button>
                </form>
            </div>
        </section>

    )
}