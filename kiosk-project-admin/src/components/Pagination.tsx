import React from 'react';
import '../style/Pagination.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];
    const maxPageNumbers = 5; // 한 번에 보여줄 페이지 번호 개수

    let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2));
    let endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);

    if (endPage - startPage + 1 < maxPageNumbers) {
        startPage = Math.max(1, endPage - maxPageNumbers + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="pagination">
            <button 
                onClick={() => onPageChange(1)} 
                disabled={currentPage === 1}
                className="page-button"
            >
                {'<<'}
            </button>
            <button 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="page-button"
            >
                {'<'}
            </button>
            {pageNumbers.map(number => (
                <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    className={`page-button ${currentPage === number ? 'active' : ''}`}
                >
                    {number}
                </button>
            ))}
            <button 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="page-button"
            >
                {'>'}
            </button>
            <button 
                onClick={() => onPageChange(totalPages)} 
                disabled={currentPage === totalPages}
                className="page-button"
            >
                {'>>'}
            </button>
        </div>
    );
};

export default Pagination; 