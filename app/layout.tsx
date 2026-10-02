import type { Metadata } from "next";
import "./globals.css";
import SiteFooter from "../components/site-footer/SiteFooter";

export const metadata: Metadata = {
	title: "Roll — Filmes e documentários",
	description: "Filmes e documentários independentes para ver online.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="pt-PT">
			<body>
				{children}
				<SiteFooter />
			</body>
		</html>
	);
}
