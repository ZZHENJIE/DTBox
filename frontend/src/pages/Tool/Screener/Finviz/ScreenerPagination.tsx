import { Center, Pagination, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

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
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const handlePageChange = (page: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    onPageChange(page);
  };

  if (totalPages <= 0) return null;

  return (
    <Center>
      <Pagination
        value={currentPage}
        onChange={handlePageChange}
        total={totalPages}
        siblings={isMobile ? 0 : 1}
        boundaries={isMobile ? 0 : 1}
      />
    </Center>
  );
}
