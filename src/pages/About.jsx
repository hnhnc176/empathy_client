import React from 'react'
import styles from '../style'

export default function About() {
    
    return (
        <div className="main-content bg-[#FCFCF4]">
            <section 
                className="about-section flex justify-between  py-20  px-0 flex-col items-center bg-background" 
                style={{ 
                    backgroundImage: "url('src/assets/about-bg.png')",
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="about-us flex flex-row items-center justify-between  mb-12 gap-[5.63rem]">
                    <div className="about-us-content max-w-[37.50rem]  mr-12 justify-between items-center">
                        <h1 className="about-title text-8xl font-black  mb-5 uppercase" 
                            style={{ fontFamily: styles.font.heading }}>
                            About Us
                        </h1>
                        <p className="about-description text-xl leading-normal text-justify"
                            style={{ fontFamily: styles.font.body }}>
                            Welcome to a space where everyone is free to speak up, share thoughts,
                            and connect across all topics and interests. Whether you're here to chill, debate, learn, or
                            just say "hi," this forum is your place to belong.
                            We believe that every voice matters, and great conversations can start from anywhere.
                        </p>
                    </div>
                    <img src="src/assets/about-img01.png" alt="About Us" className="about-image" />
                </div>
                <div className="about-vision flex flex-row justify-between  mt-12  mb-12 gap-[5.63rem]">
                    <img src="src/assets/about-img02.png" alt="Vision" className="vision-image" />
                    <div className="vision-content max-w-[37.50rem]  ml-12 justify-center
                    items-center flex flex-col text-end gap-2.5">
                        <h1 className="vision-title">Learning Through Real Conversations</h1>
                        <div className="vision-br w-2/3 h-1.5 bg-[#DDF4A6]  -mt-0.5 self-end"></div>
                        <p className="vision-description text-xl leading-normal text-end">Some of the best lessons come from real talk. In this forum, you’ll
                            discover a vibrant mix of topics and opinions, shared by friendly users from all walks of life.
                            It’s a welcoming space where you can freely grow, exchange ideas, and truly connect with
                            others—no
                            matter who you are or where you're from.</p>
                    </div>
                </div>
            </section>
            <section className="contact-section relative flex justify-between px-[80px] py-[50px] flex-row items-center bg-[url('src/assets/contact-bg.png')] bg-cover bg-center bg-no-repeat h-[110vh] ">
                <div className="contact-media flex flex-col justify-center w-[70%] gap-[20px] items-center">
                    <div className="contact-media-title flex z-10 flex-col  mt-[100px]  ml-[100px] text-[96px] h-40 w-full items-center justify-center">
                        <img src="src/assets/letstalk.svg" alt="letstalk" className="contact-ico w-full h-fit text-[#123E23]" />
                    </div>
                    <img src="src/assets/contact-img.png" alt="Media" className="contact-media-image w-[495px] h-[645px]" />
                </div>
                <div className="contact-form flex flex-col justify-center text-justify mr-20 mt-30  w-[580px] h-fit  bg-[url('src/assets/contact-form-bg.png')] bg-no-repeat bg-cover bg-center drop-shadow-xl/25 rounded-3xl">
                    <p className=' text-[16px] leading-normal w-[425px] self-end text-end  pr-[70px]  py-[40px]'><span className='font-bold'>You can reach out anytime, from anywhere. </span>
                        I’d love to hear your feedback, ideas, or anything you’d like to share about the site </p>
                    <form className="form flex flex-col justify-between gap-[30px] ">
                        <div className="input-container flex flex-col  px-[70px]  py-[0]">
                            <label htmlFor="name">Name</label>
                            <input type="text" id="name" className="form-input  border-b  border-b-[#123E23] gap-[10px]  pt-[10px] text-[16px] [transition:all_0.3s_ease] outline-none" required />
                        </div>
                        <div className="input-container flex flex-col  px-[70px]  py-[0]">
                            <label htmlFor="email">Email Address</label>
                            <input type="email" id="email" className="form-input  pt-[10px]  border-b  border-b-[#123E23] gap-[10px]  text-[16px] [transition:all_0.3s_ease] outline-none" required />
                        </div>
                        <div className="input-container flex flex-col  mb-10  px-[70px]   py-[0]">
                            <label htmlFor="message">Message</label>
                            <textarea className="form-textarea  pt-[10px] outline-none text-[16px]  border-b  border-b-[#123E23] [transition:all_0.3s_ease] h-[100px] resize-none mb-[50px]" id="message" required></textarea>
                        </div>
                        <button type="submit" className="flex items-center justify-center gap-1.5 w-full h-[70px] form-button  bg-[#123E23] !text-[#fff] px-[30px]  rounded-b-3xl py-[15px] border-[none] text-[16px] cursor-pointer bg-[url('src/assets/submit_btn-bg.png')]">Let's talk  
                            <img src="src/assets/arr_right-white.png" alt="arrow_right" className="form-ico  w-[20px]  h-[10px] text-[#fff]" /></button>
                    </form>
                </div>
            </section>

        </div>
    )
}