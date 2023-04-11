import "../styles/globals.css";
import { Inter } from "next/font/google";
import classnames from "classnames";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="text-slate-12 bg-black font-sans">
        <div className={classnames(inter.variable, "font-sans")}>
          {children}
        </div>
      </body>
    </html>
  );
}
