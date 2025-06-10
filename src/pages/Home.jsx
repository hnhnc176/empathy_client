import React from 'react';
import styles from '../style';
import { useState } from 'react';

export default function About() {
    const [activeFaq, setActiveFaq] = useState(null);

    const handleToggle = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
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
            <section className="hero-section flex flex-row justify-around items-center w-full gap-11">
                <div className="hero-text flex flex-col gap-11 text-left w-3/7 h-[500px]">
                    <h1 className="hero-title text-justify">Welcome to the Forum 
                        <br />A place to speak your mind freely, connect with others, and explore ideas—wherever you are.
                    </h1>
                    <p className="hero-description text-2xl">Join conversations, ask questions, share opinions, or just hang out. This
                        forum is open to everyone, everywhere.</p>
                    <div className="hero-cta">
                        <button className="primary-btn btn " style={{ backgroundColor: styles.colors.accent }}>Join Now</button>
                        <button className="secondary-btn btn decoration-current underline underline-offset-4">Browse Topics</button>
                    </div>
                </div>
                <img src="src/assets/img_banner.png" alt="Image" className="hero-image w-[600px] h-[500px]" />
            </section>

            <section className="features-section flex flex-row justify-around items-center w-full" style={{ backgroundColor: styles.colors.background }}>
                <img src="src/assets/banner.png" alt="Image" className="features-image w-[600px] h-[400px]" />
                <div className="features-content flex flex-col justify-between text-left w-3/7 gap-11">
                    <h1 className="features-title">Start a Conversation. Make a Connection.</h1>
                    <div className="features-list flex flex-col gap-5">
                        <p className="feature-item flex flex-row items-center gap-2.5"><img className="feature-icon  w-[18px]  h-[18px]" src="src/assets/check_ico.png" />Speak Your Mind –
                            Share your thoughts and stories.</p>
                        <p className="feature-item flex flex-row items-center gap-2.5"><img className="feature-icon  w-[18px]  h-[18px]" src="src/assets/check_ico.png" />Help & Advice – Ask
                            for help, offer tips, or lend an ear.</p>
                        <p className="feature-item flex flex-row items-center gap-2.5"><img className="feature-icon  w-[18px]  h-[18px]" src="src/assets/check_ico.png" />Interest Groups –
                            Join communities match hobbies.</p>
                        <p className="feature-item flex flex-row items-center gap-2.5"><img className="feature-icon  w-[18px]  h-[18px]" src="src/assets/check_ico.png" />Open Space – Talk
                            about anything under the sun.</p>
                    </div>
                </div>
            </section>

            <section className="cta-section flex justify-around items-center w-full gap-11">
                <div className="cta-content flex flex-col gap-11 items-start text-left justify-between w-[600px]">
                    <h1 className="cta-title text-justify">Why Join This Forum? Let's create a space that's open, supportive, and real. By
                        sharing a thought, starting a thread, or replying to someone—you help build something bigger.</h1>
                    <button className="cta-button btn  !text-[#F0F4E6]" style={{ backgroundColor: styles.colors.primary }}>Start Posting Now</button>
                </div>
                <div className="cta-img-contain w-[640px] h-[450px]  border-[2px] flex items-end justify-center bg-[#FCFCF4]">
                    <img src="src/assets/cta.png" alt="Image" className="cta-image w-3/4 h-3/4" />
                </div>
            </section>

            <section className="faq-section flex flex-col items-center justify-center gap-11"
                style={{ backgroundColor: styles.colors.background }}>
                <h1 className="faq-title">FAQ</h1>
                <div className="faq-list flex flex-col justify-between w-[1100px]">
                    {faqItems.map((item, index) => (
                        <div key={index} className="faq-item flex flex-col gap-5  mb-3  border-t-[2px]  border-[#000000]">
                            <div
                                className="faq-question-show flex flex-row items-center justify-between cursor-pointer"
                                onClick={() => handleToggle(index)}
                            >
                                <h2 className="faq-question flex flex-row items-center  mt-3">
                                    <img
                                        className="faq-question-bullet  w-8  h-8  mr-6"
                                        src="src/assets/bullet_point.png"
                                        alt="bullet_point"
                                    />
                                    {item.question}
                                </h2>
                                <img
                                    className="toggle-icon w-6 h-6 transition-transform duration-200"
                                    src={activeFaq === index ? "src/assets/hide.png" : "src/assets/plus.png"}
                                    alt="toggle"
                                />
                            </div>
                            <p className={`faq-answer transition-all duration-200 ${activeFaq === index ? 'block' : 'hidden'}`}>
                                {item.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>

    )
}