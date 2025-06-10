import React from 'react'
import mustread from '../assets/Vector.svg'
import featured from '../assets/featured.svg'

export default function SideTopics() {
    return (
        <div className="side-bar flex flex-col items-start justify-evenly h-fit gap-[35px] w-fit px-[45px] py-[35px] bg-[#F0F4E6] rounded-[6px]">
            <div className="must-read flex flex-col w-[280px]">
                <div className="must-read-title flex gap-[10px] font-['DM_Sans'] font-bold text-[#133018] mb-2">
                    <img src={mustread} /> Must-read posts
                </div>
                <ul className="must-read-list flex flex-col gap-[12px] text-[15px] font-normal underline">
                    <li className="must-read-item">
                        <div className="must-read-item-title">Please read rules before you start working on a platform</div>
                    </li>
                    <li className="must-read-item">
                        <div className="must-read-item-title">Vision & Strategy of Alemhelp</div>
                    </li>
                </ul>
            </div>
            <div className="must-read flex flex-col w-[280px]">
                <div className="must-read-title flex gap-[10px] font-['DM_Sans'] font-bold text-[#133018] mb-2">
                    <img src={featured} /> Featured links
                </div>
                <ul className="must-read-list flex flex-col gap-[12px] text-[15px] font-normal underline">
                    <li className="must-read-item">
                        <div className="must-read-item-title">Alemhelp source-code on GitHub</div>
                    </li>
                    <li className="must-read-item">
                        <div className="must-read-item-title">Golang best-practices</div>
                    </li>
                    <li className="must-read-item">
                        <div className="must-read-item-title">Alem.School dashboard</div>
                    </li>
                </ul>
            </div>
            <div className="tags flex flex-col gap-[12px] w-full">
                <div className="tags-title font-['DM_Sans'] font-bold text-[#133018] text-[20px]">
                    Popular Tags
                </div>
                <div className="tags-list flex flex-col gap-[12px] w-[fit-content]">
                    <div className="tags-item">
                        <div className="no">1</div>
                        <div className="tags-item-content">
                            <div className="tags-item-title">#javascript</div>
                            <div className="tags-item-subtitle">82,645 Posted by this tag</div>
                        </div>
                    </div>
                    <div className="tags-item">
                        <div className="no">2</div>
                        <div className="tags-item-content">
                            <div className="tags-item-title">#javascript</div>
                            <div className="tags-item-subtitle">82,645 Posted by this tag</div>
                        </div>
                    </div>
                    <div className="tags-item">
                        <div className="no">3</div>
                        <div className="tags-item-content">
                            <div className="tags-item-title">#javascript</div>
                            <div className="tags-item-subtitle">82,645 Posted by this tag</div>
                        </div>
                    </div>
                    <div className="tags-item">
                        <div className="no">4</div>
                        <div className="tags-item-content">
                            <div className="tags-item-title">#javascript</div>
                            <div className="tags-item-subtitle">82,645 Posted by this tag</div>
                        </div>
                    </div>
                    <div className="tags-item">
                        <div className="no">5</div>
                        <div className="tags-item-content">
                            <div className="tags-item-title">#javascript</div>
                            <div className="tags-item-subtitle">82,645 Posted by this tag</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}