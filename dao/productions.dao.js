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

module.exports = {
  getProductionsByEditor,
  createProduction
};