import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "aTV — A sua história começa aqui", description: "Streaming de filmes e séries selecionados pela aTV." };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="pt-PT"><body>{children}</body></html>; }
