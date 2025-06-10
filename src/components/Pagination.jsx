import React from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 6; // Show up to 6 page numbers like in the image
    
    if (totalPages <= maxVisiblePages) {
      // If total pages is less than or equal to max visible, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first few pages, current page area, and last few pages
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination flex gap-1 justify-center mt-4">
      {pageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          className={`
            w-10 h-10 flex items-center justify-center rounded text-sm font-medium transition-colors
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
    </div>
  );
}