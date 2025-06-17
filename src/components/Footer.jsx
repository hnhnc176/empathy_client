//Footer component
import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../style';
import logo from '../assets/logo.png';
import { useState } from 'react';
import { useEffect } from 'react';

export default function Footer() {
    return (
        <footer className="site-footer flex flex-col justify-between items-start gap-11 m-0  px-20  py-11" style={{ backgroundColor: styles.colors.secodary, fontFamily: styles.font.body }}>
            <div className="footer-logo font-normal text-[40px]" style={{ fontFamily: styles.font.logo }}>Empathy</div>
            <div className="footer-br w-full h-0.5  block bg-black"></div>
            <div className="footer-content flex justify-between items-start gap-20 w-full">
                <p className="copyright">©️ Empathy 2025, All right reserved</p>
                <div className="social-links flex gap-3 justify-center items-center text-md">
                    <a href="https://www.facebook.com/hnhngx" className="icon-facebook social-link" aria-label='facebook'><i className="fa-brands fa-facebook-f"></i></a>
                    <a href="https://www.facebook.com/hnhngx/" className="icon-mail social-link" aria-label='mail'><i className="fa-solid fa-paper-plane"></i></a>
                    <a href="https://www.facebook.com/hnhngx/" className="icon-github social-link" aria-label='github'><i className="fa-brands fa-github"></i></a>
                </div>
            </div>
        </footer>
    )
}