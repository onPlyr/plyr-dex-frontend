import { Button } from "@/components/ui/button"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) {
        return null
    }

    return (
        <div className="flex justify-center items-center space-x-2 mt-4">
            <Button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
                className="bg-[#daff00] text-black border-none"
            >
                Previous
            </Button>
            <span className="text-sm text-white">
                Page {currentPage} of {totalPages}
            </span>
            <Button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                className="bg-[#daff00] text-black border-none"
            >
                Next
            </Button>
        </div>
    )
}

