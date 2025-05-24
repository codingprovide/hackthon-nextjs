import "./globals.css";

export const metadata = {
  title: "港務調度系統",
  description: "Port Dispatch Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
