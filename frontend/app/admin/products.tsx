'use client';

import { useEffect, useState } from 'react';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image: '',
    category: '',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchProducts = () => {
    fetch('http://localhost:5000/products')
      .then(res => res.json())
      .then(setProducts)
      .catch(err => console.error('Error al cargar productos:', err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createProduct = async () => {
    if (!token) return alert('No autorizado');

    try {
      const res = await fetch('http://localhost:5000/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || 'Error al crear producto');

      alert('✅ Producto creado');
      setForm({ name: '', description: '', price: 0, stock: 0, image: '', category: '' });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Error al crear producto');
    }
  };

  const deleteProduct = async (id: number) => {
    if (!token) return alert('No autorizado');

    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const res = await fetch(`http://localhost:5000/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || 'Error al eliminar producto');

      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar producto');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Panel de Productos (Admin)</h1>

      <div className="grid grid-cols-2 gap-4">
        <input name="name" placeholder="Nombre" value={form.name} onChange={handleInput} className="border p-2" />
        <input name="description" placeholder="Descripción" value={form.description} onChange={handleInput} className="border p-2" />
        <input name="price" type="number" placeholder="Precio" value={form.price} onChange={handleInput} className="border p-2" />
        <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleInput} className="border p-2" />
        <input name="image" placeholder="URL imagen" value={form.image} onChange={handleInput} className="border p-2" />
        <input name="category" placeholder="Categoría" value={form.category} onChange={handleInput} className="border p-2" />
        <button onClick={createProduct} className="bg-blue-600 text-white px-4 py-2 rounded col-span-2">
          Crear producto
        </button>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-2">Lista de productos</h2>
      <ul>
        {products.map(p => (
          <li key={p.id} className="border p-2 my-2 flex justify-between items-center">
            <span>{p.name} (${p.price})</span>
            <button onClick={() => deleteProduct(p.id)} className="text-red-600 hover:underline">Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
