"use client";
import { baselightTheme } from "../../utils/theme/default-colors";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Providers } from "./providers";
import { StoreProvider } from "./store-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <ThemeProvider theme={baselightTheme}>
              <Providers>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                {children}
              </Providers>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
