import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import SearchIco from '../../assets/search-ico.png'

export default function SearchBar() {
    const [inputValue, setInputValue] = React.useState('');
    const navigate = useNavigate();

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleSearch = () => {
        if (inputValue.trim()) {
            // Navigate to search results page with query parameter
            navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    React.useEffect(() => {
        document.title = "Search | GreenBook";
    }, []);

    return (
        <div className="search-bar flex flex-row justify-between items-center w-full h-fit bg-white rounded-[7.5px] px-3 sm:px-4 lg:px-[18px] py-2 sm:py-3 lg:py-[15px] border-[1px] border-[#123E23] gap-2 sm:gap-3 lg:gap-[10px] hover-lift transition-all duration-300" style={{ backgroundColor: '#ffffff' }}>
            <div className="search-input flex flex-row items-center gap-2 sm:gap-3 lg:gap-[10px] w-full">
                <img src={SearchIco} alt="search icon" className="search-icon w-4 h-4 sm:w-5 sm:h-5 lg:w-[25px] lg:h-[25px] flex-shrink-0 transition-transform duration-300 hover:scale-110" />
                <input 
                    type="text" 
                    placeholder="Type here to search..." 
                    className="search-text w-full border-none outline-none font-['DM_Sans'] text-sm sm:text-base lg:text-[16px] transition-all duration-300 focus:placeholder-opacity-50" 
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    style={{ color: '#123E23', backgroundColor: 'transparent' }}
                />
            </div>
            <div className="search-button flex justify-center items-center min-w-[60px] sm:min-w-[80px] lg:min-w-[100px] h-8 sm:h-9 lg:h-[40px] border-l-[1px] sm:border-l-[2px] border-l-[#123E23]">
                <button 
                    className="search-btn flex justify-center font-bold items-center w-full h-full bg-transparent hover:bg-[#F0F4E6] transition-all duration-300 rounded-r-[7.5px] text-xs sm:text-sm lg:text-base px-1 sm:px-3 lg:px-0 text-[#123E23] disabled:opacity-50 disabled:cursor-not-allowed border-0 outline-none btn-animate"
                    onClick={handleSearch}
                    disabled={!inputValue.trim()}
                    style={{ color: '#123E23', backgroundColor: 'transparent' }}
                >
                    <span className="hidden sm:inline">Search</span>
                    <span className="sm:hidden font-bold">Go</span>
                </button>
            </div>
        </div>
    )
}