'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(storedCart);
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const finalizarCompra = async () => {
    const token = localStorage.getItem('token'); // Asegúrate de guardar el token al hacer login

    if (!token) {
      alert('Debes iniciar sesión para comprar');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          // Enviar productos con id y cantidad
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Error al procesar la compra');
        return;
      }

      alert('✅ ¡Compra realizada con éxito!');
      localStorage.removeItem('cart');
      setCart([]);
      router.push('/orders'); // o donde quieras redirigir al usuario

    } catch (err) {
      console.error('Error al finalizar compra:', err);
      alert('Ocurrió un error inesperado');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tu carrito</h1>
      {cart.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          <ul>
            {cart.map((item) => (
              <li key={item.id} className="border-b py-2">
                {item.name} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-bold">Total: ${total.toFixed(2)}</p>
          <button
            onClick={finalizarCompra}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Finalizar compra
          </button>
        </>
      )}
    </div>
  );
}
