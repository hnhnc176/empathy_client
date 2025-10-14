import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../style';
import { useState } from 'react';

export default function Home() {
    const [activeFaq, setActiveFaq] = useState(null);
    const navigate = useNavigate();

    const handleToggle = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const handleJoinNow = () => {
        navigate('/signup');
    };

    const handleBrowseTopics = () => {
        navigate('/community');
    };

    const handleStartPosting = () => {
        navigate('/createpost');
    };

    const faqItems = [
        {
            question: "Who can join this forum?",
            answer: "Anyone seeking mental health support and connection! This is a safe space community where people can share experiences, seek advice, and connect with others who understand. All you need is empathy and respect for fellow members."
        },
        {
            question: "Can I post in any language or from any country?",
            answer: "Absolutely! Our forum welcomes users from around the world. While English is the primary language, we encourage respectful communication regardless of your location or native language. Everyone deserves support."
        },
        {
            question: "How do I follow or join discussions?",
            answer: "Simply create an account, browse topics that interest you, and start engaging! You can like posts, save them for later, comment with support, or create your own posts. Use tags like 'anxiety', 'depression', or 'support' to find relevant discussions."
        }
    ];

    return (
        <div className="main-content w-full" style={{ fontFamily: styles.font.body, backgroundColor: styles.colors.secodary }}>
            {/* Hero Section - Mobile Responsive, Desktop Original */}
            <section className="hero-section flex flex-col lg:flex-row justify-around items-center w-full gap-4 sm:gap-6 lg:gap-11 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-16">
                <div className="hero-text flex flex-col gap-3 sm:gap-4 md:gap-6 lg:gap-11 text-center lg:text-left w-full lg:w-3/7 max-w-2xl lg:max-w-none slide-in-left">
                    <h1 className="hero-title text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                        Welcome to Empathy Forum
                        <br className="hidden sm:block" />
                        <span className="block sm:inline text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-normal mt-2 sm:mt-0"> Your safe space for mental health support, connection, and healing—together.</span>
                    </h1>
                    <p className="hero-description text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-600 leading-relaxed">
                        Share your journey, find understanding, and connect with a compassionate community. Every story matters, every voice is heard, and every step forward is celebrated here.
                    </p>
                    <div className="hero-cta flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 items-center lg:justify-start">
                        <button
                            onClick={handleJoinNow}
                            className="primary-btn btn w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 hover-lift"
                            style={{ backgroundColor: styles.colors.accent }}
                        >
                            Join Now
                        </button>
                        <button
                            onClick={handleBrowseTopics}
                            className="secondary-btn btn w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold decoration-current underline underline-offset-4 hover:opacity-80 transition-all duration-300 hover-scale"
                        >
                            Browse Topics
                        </button>
                    </div>
                </div>
                <div className="img-banner w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl h-40 sm:h-48 md:h-64 lg:h-96 xl:h-[500px] order-first lg:order-last slide-in-right">
                    <img src="src/assets/img-hero.svg" alt="Forum illustration" className="hero-image w-full h-full object-contain" />
                </div>
            </section>

            {/* Features Section - Mobile Responsive, Desktop Original */}
            <section className="features-section flex flex-col justify-around items-center w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-16 gap-4 sm:gap-6 lg:gap-11 lg:w-full lg:flex-col slide-in-bottom" style={{ backgroundColor: styles.colors.background }}>
                <h1 className="features-title text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight text-center lg:text-left mb-3 sm:mb-4 lg:mb-0">
                    Find Support. Share Hope. Build Community.
                </h1>
                <div className="features-content flex flex-col lg:flex-row lg:w-full lg:justify-center justify-between text-center lg:text-left w-full gap-4 sm:gap-6 lg:gap-11 max-w-2xl lg:max-w-none">
                    <div className="img-feature w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg lg:w-full xl:max-w-2xl h-40 sm:h-48 md:h-64 lg:h-96 xl:h-[400px] order-last lg:order-first scale-in">
                        <img src="src/assets/banner.png" alt="Community features" className="features-image w-full h-full object-cover rounded-lg hover-scale" />
                    </div>
                    <div className="features-list flex flex-col gap-2 sm:gap-3 lg:gap-5 lg:justify-center lg:w-fit">
                        <p className="feature-item flex flex-row items-center gap-2 sm:gap-2.5 text-sm sm:text-base lg:text-lg lg:w-full slide-in-right" style={{animationDelay: '0.1s'}}>
                            <img alt='check' className="feature-icon w-4 h-4 sm:w-5 sm:h-5 lg:w-[18px] lg:h-[18px] flex-shrink-0" src="src/assets/check_ico.png" />
                            <span><strong>Mental Health Support</strong></span>
                        </p>
                        <p className="feature-item flex flex-row items-center gap-2 sm:gap-2.5 text-sm sm:text-base lg:text-lg slide-in-right" style={{animationDelay: '0.2s'}}>
                            <img alt='check' className="feature-icon w-4 h-4 sm:w-5 sm:h-5 lg:w-[18px] lg:h-[18px] flex-shrink-0" src="src/assets/check_ico.png" />
                            <span><strong>Peer Connection</strong></span>
                        </p>
                        <p className="feature-item flex flex-row items-center gap-2 sm:gap-2.5 text-sm sm:text-base lg:text-lg slide-in-right" style={{animationDelay: '0.3s'}}>
                            <img alt='check' className="feature-icon w-4 h-4 sm:w-5 sm:h-5 lg:w-[18px] lg:h-[18px] flex-shrink-0" src="src/assets/check_ico.png" />
                            <span><strong>Safe Community</strong></span>
                        </p>
                        <p className="feature-item flex flex-row items-center gap-2 sm:gap-2.5 text-sm sm:text-base lg:text-lg slide-in-right" style={{animationDelay: '0.4s'}}>
                            <img alt='check' className="feature-icon w-4 h-4 sm:w-5 sm:h-5 lg:w-[18px] lg:h-[18px] flex-shrink-0" src="src/assets/check_ico.png" />
                            <span><strong>24/7 Available</strong></span>
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section - Mobile Responsive, Desktop Original */}
            <section className="cta-section flex flex-col lg:flex-row justify-around items-center w-full gap-4 sm:gap-6 lg:gap-11 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-16 slide-in-left">
                <div className="cta-content flex flex-col gap-3 sm:gap-4 md:gap-6 lg:gap-11 items-center lg:items-start text-center lg:text-left justify-between w-full lg:w-auto max-w-2xl lg:max-w-none">
                    <h1 className="cta-title text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold leading-tight">
                        Ready to Start Your Healing Journey? Join thousands who found hope, support, and understanding in our community. Your story matters, your feelings are valid, and you're never alone in this space.
                    </h1>
                    <button
                        onClick={handleStartPosting}
                        className="cta-button btn w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg hover:opacity-90 transition-all duration-300 hover-lift !text-[#F0F4E6]"
                        style={{ backgroundColor: styles.colors.primary }}
                    >
                        Start Sharing Now
                    </button>
                </div>
                <div className="cta-img-contain w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl h-40 sm:h-48 md:h-64 lg:h-96 xl:h-[450px] border-2 flex items-end justify-center bg-[#FCFCF4] rounded-lg order-first lg:order-last scale-in">
                    <img src="src/assets/cta.png" alt="Start posting illustration" className="cta-image w-3/4 h-3/4 object-contain hover-scale" />
                </div>
            </section>

            {/* FAQ Section - Mobile Responsive, Desktop Original */}
            <section className="faq-section flex flex-col items-center justify-center gap-4 sm:gap-6 lg:gap-11 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-16 slide-in-bottom"
                style={{ backgroundColor: styles.colors.background }}>
                <h1 className="faq-title text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-center">FAQ</h1>
                <div className="faq-list flex flex-col justify-between w-full max-w-4xl">
                    {faqItems.map((item, index) => (
                        <div key={index} className="faq-item flex flex-col gap-2 sm:gap-3 lg:gap-5 mb-3 sm:mb-4 lg:mb-6 border-t-2 border-[#000000] pt-3 sm:pt-4 hover-lift" style={{animationDelay: `${index * 0.1}s`}}>
                            <div
                                className="faq-question-show flex flex-row items-center justify-between cursor-pointer hover:opacity-80 transition-all duration-300"
                                onClick={() => handleToggle(index)}
                            >
                                <h2 className="faq-question flex flex-row items-center text-sm sm:text-base md:text-lg lg:text-xl font-semibold pr-2 sm:pr-4">
                                    <img
                                        className="faq-question-bullet w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 mr-2 sm:mr-3 md:mr-4 lg:mr-6 flex-shrink-0"
                                        src="src/assets/bullet_point.png"
                                        alt="bullet point"
                                    />
                                    <span className="leading-tight">{item.question}</span>
                                </h2>
                                <img
                                    className="toggle-icon w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-transform duration-200 flex-shrink-0"
                                    src={activeFaq === index ? "src/assets/hide.png" : "src/assets/plus.png"}
                                    alt="toggle"
                                    style={{
                                        transform: activeFaq === index ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}
                                />
                            </div>
                            <div className={`faq-answer-container overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                }`}>
                                <p className="faq-answer text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed pl-6 sm:pl-8 md:pl-10 lg:pl-14 pr-2 sm:pr-4 pb-2">
                                    {item.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}