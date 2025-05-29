import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { OnlineStatusProvider } from "@/context/OnlineStatusContext";
import { ThemeProvider } from "@/components/themeProvider";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "NASE - Sistema de Gestión Agrícola",
    description: "Sistema para la gestión de jornaleros y producción agrícola",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <OnlineStatusProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <Navbar />
                        {children}
                        <Toaster />
                    </ThemeProvider>
                </OnlineStatusProvider>
            </body>
        </html>
    );
}
