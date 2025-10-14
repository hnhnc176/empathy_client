//Footer component
import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../style';
import logo from '../../assets/Logo.png';
import { useState } from 'react';
import { useEffect } from 'react';

export default function Footer() {
    return (
        <footer className="site-footer flex flex-col justify-between items-start gap-4 sm:gap-6 lg:gap-11 m-0 px-4 sm:px-8 lg:px-20 py-6 sm:py-8 lg:py-11 slide-in-bottom" style={{ backgroundColor: styles.colors.secodary, fontFamily: styles.font.body }}>
            <div className="footer-logo font-normal text-2xl sm:text-3xl lg:text-[40px] text-[#123E23] scale-in" style={{ fontFamily: styles.font.logo }}>Empathy</div>
            <div className="footer-br w-full h-0.5 block bg-[#123E23]"></div>
            <div className="footer-content flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-8 lg:gap-20 w-full">
                <p className="copyright text-sm sm:text-base order-2 sm:order-1 text-[#123E23] slide-in-left">©️ Empathy 2025, All right reserved</p>
                <div className="social-links flex gap-3 sm:gap-4 justify-start sm:justify-center items-center text-sm sm:text-base lg:text-md order-1 sm:order-2 slide-in-right">
                    <a href="https://www.facebook.com/hnhngx" className="icon-facebook social-link hover:opacity-70 transition-all duration-300 hover-scale text-[#123E23]" aria-label='facebook'><i className="fa-brands fa-facebook-f"></i></a>
                    <a href="https://www.facebook.com/hnhngx/" className="icon-mail social-link hover:opacity-70 transition-all duration-300 hover-scale text-[#123E23]" aria-label='mail'><i className="fa-solid fa-paper-plane"></i></a>
                    <a href="https://www.facebook.com/hnhngx/" className="icon-github social-link hover:opacity-70 transition-all duration-300 hover-scale text-[#123E23]" aria-label='github'><i className="fa-brands fa-github"></i></a>
                </div>
            </div>
        </footer>
    )
}