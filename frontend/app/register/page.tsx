'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error en registro');

      setMensaje('✅ ¡Registro exitoso! Ya puedes iniciar sesión');
      setForm({ name: '', email: '', password: '' });
    } catch (err: any) {
      setMensaje('❌ ' + err.message);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6 mt-10 bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold text-black">Crear cuenta</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded text-black"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 rounded text-black"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className="w-full border p-2 rounded text-black"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Registrarme
        </button>
      </form>
      {mensaje && <p className="text-center text-black">{mensaje}</p>}
    </main>
  );
}
