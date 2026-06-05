import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import { Providers } from "./providers";

const prompt = Prompt({
    weight: ["300", "400", "500", "600", "700"],
    subsets: ["thai", "latin"],
    variable: "--font-prompt",
});

export const metadata: Metadata = {
    title: "MHC9 Elder Care",
    description: "ระบบคัดกรองและดูแลสุขภาพผู้สูงอายุ เขตสุขภาพที่ 9",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="th" className={`${prompt.variable} h-full antialiased`}>
            <body className="min-h-full flex flex-col bg-background font-sans font-medium">
                <Providers>
                    <Header />

                    <main className="flex-1">
                        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                            {children}
                        </div>
                    </main>

                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
