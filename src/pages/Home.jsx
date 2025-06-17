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
            answer: "Lorem ipsum dolor sit amet consectetur. Nunc et nulla laoreet et. Tincidunt feugiat in lectus quis."
        },
        {
            question: "Can I post in any language or from any country?",
            answer: "Neque porttitor arcu faucibus elementum egestas. Id proin malesuada leo nunc est fringilla."
        },
        {
            question: "How do I follow or join discussions?",
            answer: "Dis rhoncus magnis dictum dui interdum ullamcorper donec adipiscing. Lorem ipsum dolor sit amet."
        }
    ];

    return (
        <div className="main-content w-full" style={{ fontFamily: styles.font.body, backgroundColor: styles.colors.secodary }}>
            {/* Hero Section - Mobile Responsive, Desktop Original */}
            <section className="hero-section flex flex-col lg:flex-row justify-around items-center w-full gap-4 sm:gap-6 lg:gap-11 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-16">
                <div className="hero-text flex flex-col gap-4 sm:gap-6 lg:gap-11 text-center lg:text-left w-full lg:w-3/7 max-w-2xl lg:max-w-none">
                    <h1 className="hero-title text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                        Welcome to the Forum
                        <br className="hidden sm:block" />
                        <span className="block sm:inline"> A place to speak your mind freely, connect with others, and explore ideas—wherever you are.</span>
                    </h1>
                    <p className="hero-description text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed">
                        Join conversations, ask questions, share opinions, or just hang out. This forum is open to everyone, everywhere.
                    </p>
                    <div className="hero-cta flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 items-center lg:justify-start">
                        <button
                            onClick={handleJoinNow}
                            className="primary-btn btn w-full sm:w-auto px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: styles.colors.accent }}
                        >
                            Join Now
                        </button>
                        <button
                            onClick={handleBrowseTopics}
                            className="secondary-btn btn w-full sm:w-auto px-6 py-3 font-semibold decoration-current underline underline-offset-4 hover:opacity-80 transition-opacity"
                        >
                            Browse Topics
                        </button>
                    </div>
                </div>
                <div className="img-banner w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-2xl h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] order-first lg:order-last">
                    <img src="src/assets/img-hero.svg" alt="Forum illustration" className="hero-image w-full h-full object-contain" />
                </div>
            </section>

            {/* Features Section - Mobile Responsive, Desktop Original */}
            <section className="features-section flex flex-col justify-around items-center w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-16 gap-6 lg:gap-11 lg:w-full lg:flex-col" style={{ backgroundColor: styles.colors.background }}>
                <h1 className="features-title text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-center lg:text-left mb-4 lg:mb-0">
                    Start a Conversation. Make a Connection.
                </h1>
                <div className="features-content flex flex-col lg:flex-row lg:w-full lg:justify-center justify-between text-center lg:text-left w-full gap-6 lg:gap-11 max-w-2xl lg:max-w-none">
                    <div className="img-feature w-full max-w-sm sm:max-w-md lg:max-w-lg lg:w-full xl:max-w-2xl h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[400px] order-last lg:order-first">
                        <img src="src/assets/banner.png" alt="Community features" className="features-image w-full h-full object-cover rounded-lg" />
                    </div>
                    <div className="features-list flex flex-col gap-3 sm:gap-4 lg:gap-5 lg:justify-center lg:w-fit">
                        <p className="feature-item flex flex-row items-center gap-2 sm:gap-2.5 text-sm sm:text-base lg:text-lg lg:w-full">
                            <img alt='check' className="feature-icon w-4 h-4 sm:w-5 sm:h-5 lg:w-[18px] lg:h-[18px] flex-shrink-0" src="src/assets/check_ico.png" />
                            <span><strong>Speak Your Mind</strong></span>
                        </p>
                        <p className="feature-item flex flex-row items-center gap-2 sm:gap-2.5 text-sm sm:text-base lg:text-lg">
                            <img alt='check' className="feature-icon w-4 h-4 sm:w-5 sm:h-5 lg:w-[18px] lg:h-[18px] flex-shrink-0" src="src/assets/check_ico.png" />
                            <span><strong>Help & Advice</strong></span>
                        </p>
                        <p className="feature-item flex flex-row items-center gap-2 sm:gap-2.5 text-sm sm:text-base lg:text-lg">
                            <img alt='check' className="feature-icon w-4 h-4 sm:w-5 sm:h-5 lg:w-[18px] lg:h-[18px] flex-shrink-0" src="src/assets/check_ico.png" />
                            <span><strong>Interest Groups</strong></span>
                        </p>
                        <p className="feature-item flex flex-row items-center gap-2 sm:gap-2.5 text-sm sm:text-base lg:text-lg">
                            <img alt='check' className="feature-icon w-4 h-4 sm:w-5 sm:h-5 lg:w-[18px] lg:h-[18px] flex-shrink-0" src="src/assets/check_ico.png" />
                            <span><strong>Open Space</strong></span>
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section - Mobile Responsive, Desktop Original */}
            <section className="cta-section flex flex-col lg:flex-row justify-around items-center w-full gap-6 lg:gap-11 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-16">
                <div className="cta-content flex flex-col gap-4 sm:gap-6 lg:gap-11 items-center lg:items-start text-center lg:text-left justify-between w-full lg:w-auto max-w-2xl lg:max-w-none">
                    <h1 className="cta-title text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight">
                        Why Join This Forum? Let's create a space that's open, supportive, and real. By sharing a thought, starting a thread, or replying to someone—you help build something bigger.
                    </h1>
                    <button
                        onClick={handleStartPosting}
                        className="cta-button btn w-full sm:w-auto px-6 py-3 font-semibold rounded-lg hover:opacity-90 transition-opacity !text-[#F0F4E6]"
                        style={{ backgroundColor: styles.colors.primary }}
                    >
                        Start Posting Now
                    </button>
                </div>
                <div className="cta-img-contain w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-2xl h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[450px] border-2 flex items-end justify-center bg-[#FCFCF4] rounded-lg order-first lg:order-last">
                    <img src="src/assets/cta.png" alt="Start posting illustration" className="cta-image w-3/4 h-3/4 object-contain" />
                </div>
            </section>

            {/* FAQ Section - Mobile Responsive, Desktop Original */}
            <section className="faq-section flex flex-col items-center justify-center gap-6 lg:gap-11 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-16"
                style={{ backgroundColor: styles.colors.background }}>
                <h1 className="faq-title text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-center">FAQ</h1>
                <div className="faq-list flex flex-col justify-between w-full max-w-4xl">
                    {faqItems.map((item, index) => (
                        <div key={index} className="faq-item flex flex-col gap-2 sm:gap-3 lg:gap-5 mb-3 sm:mb-4 lg:mb-6 border-t-2 border-[#000000] pt-3 sm:pt-4">
                            <div
                                className="faq-question-show flex flex-row items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => handleToggle(index)}
                            >
                                <h2 className="faq-question flex flex-row items-center text-sm sm:text-base md:text-lg lg:text-xl font-semibold pr-2 sm:pr-4">
                                    <img
                                        className="faq-question-bullet w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mr-2 sm:mr-3 md:mr-4 lg:mr-6 flex-shrink-0"
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
                                <p className="faq-answer text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed pl-7 sm:pl-9 md:pl-11 lg:pl-14 pr-2 sm:pr-4 pb-2">
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