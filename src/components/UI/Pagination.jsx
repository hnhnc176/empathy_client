import React from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = window.innerWidth < 640 ? 3 : 6; // Show fewer pages on mobile
    
    if (totalPages <= maxVisiblePages) {
      // If total pages is less than or equal to max visible, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first few pages, current page area, and last few pages
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination flex flex-wrap gap-1 sm:gap-1 justify-center mt-4 px-2">
      {/* Previous button for mobile */}
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded text-xs sm:text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 sm:hidden"
        >
          ‹
        </button>
      )}
      
      {pageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          className={`
            w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded text-xs sm:text-sm font-medium transition-colors
            ${
              currentPage === pageNumber
                ? 'bg-[#DDF4A6] text-[#123E23] border border-[#123E23]' // Green background for current page
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }
          `}
        >
          {pageNumber}
        </button>
      ))}
      
      {/* Next button for mobile */}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded text-xs sm:text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 sm:hidden"
        >
          ›
        </button>
      )}
    </div>
  );
}