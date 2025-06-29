'use client';

import { useEffect, useState } from 'react';

type Order = {
  id: number;
  total: number;
  created_at: string;
  items: {
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Debes iniciar sesión');
      return;
    }

    fetch('http://localhost:5000/orders/user', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al obtener órdenes:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4">Cargando órdenes...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mis Órdenes</h1>
      {orders.length === 0 ? (
        <p>No tienes órdenes registradas.</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="border rounded p-4 mb-4">
            <p className="font-semibold">Orden #{order.id}</p>
            <p>Fecha: {new Date(order.created_at).toLocaleDateString()}</p>
            <p>Total: ${order.total.toFixed(2)}</p>
            <ul className="mt-2">
              {order.items.map((item, index) => (
                <li key={index} className="flex items-center gap-2 mb-2">
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                  <span>{item.name} x {item.quantity}</span>
                  <span className="ml-auto font-bold">${item.price}</span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
