import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { AppProps } from "next/app";
import Layout from "@/sections/layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 👇 ye add kar
import { ThemeModeProvider } from "@/context/ThemeContext";

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* 👇 pura app ko wrap kar diya ThemeModeProvider ke andar */}
      <ThemeModeProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeModeProvider>
    </QueryClientProvider>
  );
}