import { CartProvider } from '@/context/CartContext'; // ajusta la ruta si es distinta

export const metadata = {
  title: 'Mi tienda',
  description: 'Tienda online con Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}