import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignedOut, SignedIn, SignIn } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "S3 File Browser",
  description: "Minimal S3 file browser with dark mode",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-gray-100 min-h-screen`}
        >
          <SignedOut>
            <div className="min-h-screen flex justify-center items-center bg-gray-950">
              <div className="w-full max-w-md">
                <SignIn 
                  routing="hash"
                  appearance={{
                    elements: {
                      rootBox: "mx-auto",
                      card: "bg-gray-900 border border-gray-800 shadow-2xl",
                      headerTitle: "text-gray-100",
                      headerSubtitle: "text-gray-400",
                      socialButtonsBlockButton: "bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700",
                      formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                      formFieldInput: "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500",
                      formFieldLabel: "text-gray-300",
                      identityPreviewText: "text-gray-400",
                      identityPreviewEditButton: "text-blue-400 hover:text-blue-300",
                      footer: "hidden"
                    },
                    variables: {
                      colorPrimary: '#2563eb',
                      colorBackground: '#111827',
                      colorInputBackground: '#1f2937',
                      colorInputText: '#f3f4f6',
                      colorText: '#f3f4f6',
                      colorTextSecondary: '#9ca3af'
                    }
                  }}
                />
              </div>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="min-h-screen bg-gray-950 text-gray-100">
              {children}
            </div>
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
}
