// coup-client/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Importa seu CSS global

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Coup - Create Room', // Título da página
  description: 'Create a new room for the Coup game.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Bootstrap CSS via CDN */}
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
          integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        {children} {/* Aqui é onde o conteúdo da sua página (page.tsx) será renderizado */}
      </body>
    </html>
  );
}