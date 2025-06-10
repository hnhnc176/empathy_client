import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import SearchIco from '../assets/search-ico.png'

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
        <div className="search-bar flex flex-row justify-between items-center w-full h-[fit-content] bg-[#ffffff] rounded-[7.5px] px-[18px] py-[15px] border-[1px] border-[#123E23] gap-[10px]">
            <div className="search-input flex flex-row items-center gap-[10px] w-full">
                <img src={SearchIco} alt="search icon" className="search-icon w-[25px] h-[25px]" />
                <input 
                    type="text" 
                    placeholder="Type here to search..." 
                    className="search-text w-full border-none outline-none font-['DM_Sans'] text-[16px]" 
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />
            </div>
            <div className="search-button flex justify-center items-center w-[100px] h-[40px] border-l-[2px] border-l-[#123E23]">
                <button 
                    className="search-btn flex justify-center font-semibold items-center w-[100px] h-[40px] hover:bg-[#F0F4E6] transition-colors duration-200 rounded-r-[7.5px]"
                    onClick={handleSearch}
                    disabled={!inputValue.trim()}
                >
                    Search
                </button>
            </div>
        </div>
    )
}