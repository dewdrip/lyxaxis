"use client";

import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
