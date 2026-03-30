import { Button, HStack, Text } from "@chakra-ui/react";

type PaginationProps = {
  page: number;
  totalCount: number;
  pageSize?: number;
  onPageChange: (nextPage: number) => void;
};

export function Pagination({
  page,
  totalCount,
  pageSize = 20,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <HStack spacing={3} alignItems="center">
      <Button
        size="sm"
        type="button"
        isDisabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </Button>
      <Text>
        Page {page} / {totalPages}
      </Text>
      <Button
        size="sm"
        type="button"
        isDisabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </HStack>
  );
}
