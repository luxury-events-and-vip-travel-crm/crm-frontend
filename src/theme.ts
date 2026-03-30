import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  styles: {
    global: {
      "html, body": {
        height: "100%",
      },
      body: {
        bg: "gray.50",
        color: "gray.900",
      },
    },
  },
});
