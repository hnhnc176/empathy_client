import React from 'react'
import styles from '../style'

export default function About() {
    
    return (
        <div className="main-content bg-[#FCFCF4]">
            {/* About Section - Phone Responsive */}
            <section 
                className="about-section flex justify-between py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-0 flex-col items-center bg-background" 
                style={{ 
                    backgroundImage: "url('src/assets/about-bg.png')",
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                }}
            >
                {/* About Us Block - Phone Responsive */}
                <div className="about-us flex flex-col sm:flex-row items-center justify-center sm:justify-between mb-8 sm:mb-10 md:mb-12 gap-6 sm:gap-8 md:gap-12 lg:gap-[5.63rem] w-full max-w-7xl">
                    <div className="about-us-content max-w-none sm:max-w-[37.50rem] mr-0 sm:mr-6 md:mr-8 lg:mr-12 text-center sm:text-left order-2 sm:order-1">
                        <h1 className="about-title text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-3 sm:mb-4 md:mb-5 uppercase leading-tight" 
                            style={{ fontFamily: styles.font.heading }}>
                            About Us
                        </h1>
                        <p className="about-description text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-justify px-2 sm:px-0"
                            style={{ fontFamily: styles.font.body }}>
                            Welcome to a space where everyone is free to speak up, share thoughts,
                            and connect across all topics and interests. Whether you're here to chill, debate, learn, or
                            just say "hi," this forum is your place to belong.
                            We believe that every voice matters, and great conversations can start from anywhere.
                        </p>
                    </div>
                    <div className="about-image-container order-1 sm:order-2 w-full sm:w-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-none">
                        <img src="src/assets/about-img01.png" alt="About Us" className="about-image w-full h-auto object-contain" />
                    </div>
                </div>

                {/* Vision Block - Phone Responsive */}
                <div className="about-vision flex flex-col sm:flex-row justify-center sm:justify-between items-center mt-8 sm:mt-10 md:mt-12 mb-8 sm:mb-10 md:mb-12 gap-6 sm:gap-8 md:gap-12 lg:gap-[5.63rem] w-full max-w-7xl">
                    <div className="vision-image-container order-1 w-full sm:w-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-none">
                        <img src="src/assets/about-img02.png" alt="Vision" className="vision-image w-full h-auto object-contain" />
                    </div>
                    <div className="vision-content max-w-none sm:max-w-[37.50rem] ml-0 sm:ml-6 md:ml-8 lg:ml-12 justify-center items-center flex flex-col text-center sm:text-end gap-2.5 order-2">
                        <h1 className="vision-title text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight"
                            style={{ fontFamily: styles.font.heading }}>
                            Learning Through Real Conversations
                        </h1>
                        <div className="vision-br w-1/2 sm:w-2/3 h-1 sm:h-1.5 bg-[#DDF4A6] -mt-0.5 self-center sm:self-end"></div>
                        <p className="vision-description text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-center sm:text-end px-2 sm:px-0"
                            style={{ fontFamily: styles.font.body }}>
                            Some of the best lessons come from real talk. In this forum, you'll
                            discover a vibrant mix of topics and opinions, shared by friendly users from all walks of life.
                            It's a welcoming space where you can freely grow, exchange ideas, and truly connect with
                            others—no matter who you are or where you're from.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Section - Phone Responsive */}
            <section className="contact-section relative flex flex-col-reverse lg:flex-row justify-center lg:justify-between px-4 sm:px-6 md:px-8 lg:px-[80px] py-8 sm:py-10 md:py-12 lg:py-[50px] items-center bg-[url('src/assets/contact-bg.png')] bg-cover bg-center bg-no-repeat min-h-screen lg:h-[110vh]">
                
                {/* Contact Media - Phone Responsive */}
                <div className="contact-media flex flex-col justify-center w-full lg:w-[70%] gap-4 sm:gap-5 md:gap-6 lg:gap-[20px] items-center order-2 lg:order-1">
                    <div className="contact-media-title flex z-10 flex-col mt-4 sm:mt-6 md:mt-8 lg:mt-[100px] ml-0 lg:ml-[100px] w-full items-center justify-center">
                        <img src="src/assets/letstalk.svg" alt="letstalk" className="contact-ico w-3/4 sm:w-4/5 md:w-full lg:w-full h-auto text-[#123E23] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-none" />
                    </div>
                    <div className="contact-image-container w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-none">
                        <img src="src/assets/contact-img.png" alt="Media" className="contact-media-image w-full h-auto object-contain lg:w-[495px] lg:h-[645px]" />
                    </div>
                </div>

                {/* Contact Form - Phone Responsive */}
                <div className="contact-form-container w-full flex justify-center lg:w-auto max-w-lg sm:w-full sm:items-center sm:justify-center lg:max-w-none order-1 lg:order-2 mb-8 lg:mb-0">
                    <div className="contact-form flex flex-col justify-center text-justify mr-0 lg:mr-20 mt-0 lg:mt-30 w-full lg:w-[580px] h-fit bg-[url('src/assets/contact-form-bg.png')] bg-no-repeat bg-cover bg-center drop-shadow-xl/25 rounded-3xl mx-4 sm:mx-6 lg:mx-0">
                        
                        {/* Form Header - Phone Responsive */}
                        <p className="text-sm sm:text-base lg:text-[16px] leading-normal w-full lg:w-[425px] self-center lg:self-end text-center lg:text-end pr-4 sm:pr-6 lg:pr-[70px] pl-4 sm:pl-6 lg:pl-0 py-6 sm:py-8 lg:py-[40px]"
                            style={{ fontFamily: styles.font.body }}>
                            <span className="font-bold">You can reach out anytime, from anywhere. </span>
                            I'd love to hear your feedback, ideas, or anything you'd like to share about the site
                        </p>

                        {/* Form - Phone Responsive */}
                        <form className="form flex flex-col justify-between gap-4 sm:gap-5 lg:gap-[30px]">
                            
                            {/* Name Input - Phone Responsive */}
                            <div className="input-container flex flex-col px-4 sm:px-6 lg:px-[70px] py-0">
                                <label htmlFor="name" className="text-sm sm:text-base mb-1 sm:mb-2"
                                    style={{ fontFamily: styles.font.body }}>
                                    Name
                                </label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    className="form-input border-0 border-b border-b-[#123E23] bg-transparent pt-2 sm:pt-3 lg:pt-[10px] text-sm sm:text-base lg:text-[16px] transition-all duration-300 ease-in-out outline-none focus:border-[#17B367]" 
                                    style={{ fontFamily: styles.font.body }}
                                    required 
                                />
                            </div>

                            {/* Email Input - Phone Responsive */}
                            <div className="input-container flex flex-col px-4 sm:px-6 lg:px-[70px] py-0">
                                <label htmlFor="email" className="text-sm sm:text-base mb-1 sm:mb-2"
                                    style={{ fontFamily: styles.font.body }}>
                                    Email Address
                                </label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    className="form-input border-0 border-b border-b-[#123E23] bg-transparent pt-2 sm:pt-3 lg:pt-[10px] text-sm sm:text-base lg:text-[16px] transition-all duration-300 ease-in-out outline-none focus:border-[#17B367]" 
                                    style={{ fontFamily: styles.font.body }}
                                    required 
                                />
                            </div>

                            {/* Message Input - Phone Responsive */}
                            <div className="input-container flex flex-col mb-6 sm:mb-8 lg:mb-10 px-4 sm:px-6 lg:px-[70px] py-0">
                                <label htmlFor="message" className="text-sm sm:text-base mb-1 sm:mb-2"
                                    style={{ fontFamily: styles.font.body }}>
                                    Message
                                </label>
                                <textarea 
                                    className="form-textarea border-0 border-b border-b-[#123E23] bg-transparent pt-2 sm:pt-3 lg:pt-[10px] outline-none text-sm sm:text-base lg:text-[16px] transition-all duration-300 ease-in-out h-20 sm:h-24 lg:h-[100px] resize-none mb-6 sm:mb-8 lg:mb-[50px] focus:border-[#17B367]" 
                                    id="message" 
                                    style={{ fontFamily: styles.font.body }}
                                    required
                                ></textarea>
                            </div>

                            {/* Submit Button - Phone Responsive */}
                            <button 
                                type="submit" 
                                className="flex items-center justify-center gap-1 sm:gap-1.5 w-full h-12 sm:h-14 lg:h-[70px] form-button bg-[#123E23] !text-[#fff] px-4 sm:px-6 lg:px-[30px] rounded-b-3xl py-3 sm:py-4 lg:py-[15px] border-[none] text-sm sm:text-base lg:text-[16px] cursor-pointer bg-[url('src/assets/submit_btn-bg.png')] hover:bg-[#17B367] transition-colors duration-300"
                                style={{ fontFamily: styles.font.body }}
                            >
                                Let's talk  
                                <img 
                                    src="src/assets/arr_right-white.png" 
                                    alt="arrow_right" 
                                    className="form-ico w-4 sm:w-5 lg:w-[20px] h-2 sm:h-2.5 lg:h-[10px] text-[#fff]" 
                                />
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    )
}