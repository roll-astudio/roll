import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteFooter from "../components/site-footer/SiteFooter";

const inter = Inter({
	subsets: ["latin"],
	weight: ["400", "700"],
	variable: "--font-inter",
});

export const metadata: Metadata = {
	title: "Roll — Filmes e documentários",
	description: "Filmes e documentários independentes para ver online.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="pt-PT" className={inter.variable}>
			<body>
				{children}
				<SiteFooter />
			</body>
		</html>
	);
}
