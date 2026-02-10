import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";
import 'katex/dist/katex.min.css';

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InvestLab",
  description: "InvestLab authentication portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              var s=document.documentElement.getAttribute('data-theme')||localStorage.getItem('theme');
              if(s==='dark'||(!s&&window.matchMedia('(prefers-color-scheme: dark)').matches))
                document.documentElement.classList.add('dark');
              else
                document.documentElement.classList.remove('dark');
            })();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${spaceGrotesk.variable} ${fraunces.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

