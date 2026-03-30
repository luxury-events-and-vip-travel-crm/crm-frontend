import { HStack, Spinner as ChakraSpinner, Text } from "@chakra-ui/react";

type SpinnerProps = {
  label?: string;
};

export function Spinner({ label = "Loading..." }: SpinnerProps) {
  return (
    <HStack spacing={3} alignItems="center">
      <ChakraSpinner size="sm" />
      <Text>{label}</Text>
    </HStack>
  );
}
