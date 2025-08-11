import { useState } from 'react';

export function usePagination<T>(data: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);
  
  return {
    currentPage,
    setCurrentPage,
    totalPages,
    currentData,
    hasMultiplePages: totalPages > 1
  };
}