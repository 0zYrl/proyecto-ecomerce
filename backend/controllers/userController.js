const { pool } = require('../models/userModel');

const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Rol actualizado', usuario: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
};

module.exports = { updateUserRole };
