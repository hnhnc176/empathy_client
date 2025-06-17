import React from 'react'
import mustread from '../assets/Vector.svg'
import featured from '../assets/featured.svg'

export default function SideTopics() {
    return (
        <div className="side-bar flex flex-col items-start justify-evenly h-fit gap-6 sm:gap-8 lg:gap-[35px] w-full sm:w-fit px-4 sm:px-6 lg:px-[45px] py-4 sm:py-6 lg:py-[35px] bg-[#F0F4E6] rounded-[6px]">
            {/* Must-read posts section - Mobile Responsive */}
            <div className="must-read flex flex-col w-full sm:w-full lg:w-[280px]">
                <div className="must-read-title flex gap-2 sm:gap-2.5 lg:gap-[10px] font-['DM_Sans'] font-bold text-[#133018] mb-2 text-sm sm:text-base lg:text-base">
                    <img src={mustread} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-auto lg:h-auto" alt="must read" /> 
                    <span>Must-read posts</span>
                </div>
                <ul className="must-read-list flex flex-col gap-2 sm:gap-2.5 lg:gap-[12px] text-xs sm:text-sm lg:text-[15px] font-normal underline">
                    <li className="must-read-item">
                        <div className="must-read-item-title leading-relaxed">Community Guidelines & Forum Rules</div>
                    </li>
                    <li className="must-read-item">
                        <div className="must-read-item-title leading-relaxed">How to Report Content & Get Help</div>
                    </li>
                    <li className="must-read-item">
                        <div className="must-read-item-title leading-relaxed">Email Verification & Account Security</div>
                    </li>
                </ul>
            </div>

            {/* Featured links section - Mobile Responsive */}
            <div className="must-read flex flex-col w-full sm:w-full lg:w-[280px]">
                <div className="must-read-title flex gap-2 sm:gap-2.5 lg:gap-[10px] font-['DM_Sans'] font-bold text-[#133018] mb-2 text-sm sm:text-base lg:text-base">
                    <img src={featured} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-auto lg:h-auto" alt="featured" /> 
                    <span>Featured links</span>
                </div>
                <ul className="must-read-list flex flex-col gap-2 sm:gap-2.5 lg:gap-[12px] text-xs sm:text-sm lg:text-[15px] font-normal underline">
                    <li className="must-read-item">
                        <div className="must-read-item-title leading-relaxed">EmpathyForum API Documentation</div>
                    </li>
                    <li className="must-read-item">
                        <div className="must-read-item-title leading-relaxed">Node.js & Express Best Practices</div>
                    </li>
                    <li className="must-read-item">
                        <div className="must-read-item-title leading-relaxed">MongoDB Schema Design Guide</div>
                    </li>
                    <li className="must-read-item">
                        <div className="must-read-item-title leading-relaxed">JWT Authentication Setup</div>
                    </li>
                </ul>
            </div>

            {/* Popular Tags section - Mobile Responsive */}
            <div className="tags flex flex-col gap-2 sm:gap-2.5 lg:gap-[12px] w-full">
                <div className="tags-title font-['DM_Sans'] font-bold text-[#133018] text-base sm:text-lg lg:text-[20px]">
                    Popular Tags
                </div>
                <div className="tags-list flex flex-col gap-2 sm:gap-2.5 lg:gap-[12px] w-full lg:w-[fit-content]">
                    <div className="tags-item flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-2.5 lg:p-0 hover:bg-white/50 rounded lg:hover:bg-transparent transition-colors">
                        <div className="no text-sm sm:text-base lg:text-base font-semibold text-[#133018] w-4 sm:w-5 lg:w-auto flex-shrink-0">1</div>
                        <div className="tags-item-content flex-1 min-w-0">
                            <div className="tags-item-title text-sm sm:text-base lg:text-base font-medium text-[#133018] truncate">#mental-health</div>
                            <div className="tags-item-subtitle text-xs sm:text-sm lg:text-sm text-[#133018]/70 truncate">15,432 Posted by this tag</div>
                        </div>
                    </div>
                    <div className="tags-item flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-2.5 lg:p-0 hover:bg-white/50 rounded lg:hover:bg-transparent transition-colors">
                        <div className="no text-sm sm:text-base lg:text-base font-semibold text-[#133018] w-4 sm:w-5 lg:w-auto flex-shrink-0">2</div>
                        <div className="tags-item-content flex-1 min-w-0">
                            <div className="tags-item-title text-sm sm:text-base lg:text-base font-medium text-[#133018] truncate">#support</div>
                            <div className="tags-item-subtitle text-xs sm:text-sm lg:text-sm text-[#133018]/70 truncate">12,876 Posted by this tag</div>
                        </div>
                    </div>
                    <div className="tags-item flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-2.5 lg:p-0 hover:bg-white/50 rounded lg:hover:bg-transparent transition-colors">
                        <div className="no text-sm sm:text-base lg:text-base font-semibold text-[#133018] w-4 sm:w-5 lg:w-auto flex-shrink-0">3</div>
                        <div className="tags-item-content flex-1 min-w-0">
                            <div className="tags-item-title text-sm sm:text-base lg:text-base font-medium text-[#133018] truncate">#anxiety</div>
                            <div className="tags-item-subtitle text-xs sm:text-sm lg:text-sm text-[#133018]/70 truncate">9,654 Posted by this tag</div>
                        </div>
                    </div>
                    <div className="tags-item flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-2.5 lg:p-0 hover:bg-white/50 rounded lg:hover:bg-transparent transition-colors">
                        <div className="no text-sm sm:text-base lg:text-base font-semibold text-[#133018] w-4 sm:w-5 lg:w-auto flex-shrink-0">4</div>
                        <div className="tags-item-content flex-1 min-w-0">
                            <div className="tags-item-title text-sm sm:text-base lg:text-base font-medium text-[#133018] truncate">#depression</div>
                            <div className="tags-item-subtitle text-xs sm:text-sm lg:text-sm text-[#133018]/70 truncate">8,321 Posted by this tag</div>
                        </div>
                    </div>
                    <div className="tags-item flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-2.5 lg:p-0 hover:bg-white/50 rounded lg:hover:bg-transparent transition-colors">
                        <div className="no text-sm sm:text-base lg:text-base font-semibold text-[#133018] w-4 sm:w-5 lg:w-auto flex-shrink-0">5</div>
                        <div className="tags-item-content flex-1 min-w-0">
                            <div className="tags-item-title text-sm sm:text-base lg:text-base font-medium text-[#133018] truncate">#wellness</div>
                            <div className="tags-item-subtitle text-xs sm:text-sm lg:text-sm text-[#133018]/70 truncate">7,543 Posted by this tag</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}