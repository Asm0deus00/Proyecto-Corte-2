const db = require('./db');

async function getProductionsByEditor(id_editor) {
  const [rows] = await db.query(
    'SELECT * FROM productions WHERE id_editor = ?',
    [id_editor]
  );
  return rows;
}

async function createProduction(production) {
  const {
    id_editor,
    id_client,
    title,
    video_type,
    duration,
    price,
    status
  } = production;

  await db.query(
    `INSERT INTO productions 
     (id_editor, id_client, title, video_type, duration, price, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id_editor, id_client, title, video_type, duration, price, status]
  );
}

async function deleteProduction(id_production) {
  await db.query(
    'DELETE FROM productions WHERE id_production = ?',
    [id_production]
  );
}

async function updateProductionStatus(id_production, status) {
  await db.query(
    'UPDATE productions SET status = ? WHERE id_production = ?',
    [status, id_production]
  );
}

module.exports = {
  getProductionsByEditor,
  createProduction,
  deleteProduction,
  updateProductionStatus
};