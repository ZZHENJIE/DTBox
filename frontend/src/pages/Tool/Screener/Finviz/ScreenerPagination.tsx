import { Center, Pagination } from "@mantine/core";

interface ScreenerPaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function ScreenerPagination({
  totalPages,
  currentPage,
  onPageChange,
}: ScreenerPaginationProps) {
  if (totalPages <= 0) return null;

  return (
    <Center mt="md">
      <Pagination
        value={currentPage}
        onChange={onPageChange}
        total={totalPages}
      />
    </Center>
  );
}
