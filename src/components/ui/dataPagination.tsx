import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DataPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function DataPagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev,
}: DataPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (hasPrev) onPageChange(currentPage - 1);
            }}
          />
        </PaginationItem>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              isActive={currentPage === page}
              onClick={(e) => {
                e.preventDefault();
                onPageChange(page);
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (hasNext) onPageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
