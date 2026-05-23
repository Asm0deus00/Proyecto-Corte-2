const db = require('./db');

// ==================== GET INVOICES ====================
async function getInvoicesByEditor(id_editor) {
  const [rows] = await db.query(
    'SELECT * FROM invoices WHERE id_editor = ? ORDER BY id_invoice DESC',
    [id_editor]
  );
  return rows;
}

// ==================== VALIDATE PRODUCTIONS ====================
async function fetchValidatedProductions(id_editor, production_ids) {
  if (!Array.isArray(production_ids) || production_ids.length === 0) {
    throw new Error("Debe seleccionar al menos una produccion completada");
  }

  const validRows = [];
  for (const prodId of production_ids) {
    const [rows] = await db.query(
      `SELECT price FROM productions
       WHERE id_production = ? AND id_editor = ? AND status = 'completed'`,
      [prodId, id_editor]
    );
    if (rows.length > 0) {
      validRows.push({ id: prodId, price: Number(rows[0].price) });
    }
  }

  if (validRows.length === 0) {
    throw new Error("Ninguna produccion valida para facturar");
  }

  return validRows;
}

// ==================== CALCULATE INVOICE TOTAL ====================
function calculateInvoiceTotal(validRows) {
  return validRows.reduce((sum, row) => sum + row.price, 0);
}

// ==================== INSERT INVOICE ====================
async function insertInvoice(id_editor, validRows, total) {
  const productionsString = validRows.map(r => r.id).join(',');
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

  const [result] = await db.query(
    `INSERT INTO invoices
     (id_editor, productions_ids, invoice_number, issue_date, subtotal, total, status)
     VALUES (?, ?, ?, CURDATE(), ?, ?, 'draft')`,
    [id_editor, productionsString, invoiceNumber, total, total]
  );

  return {
    id_invoice: result.insertId,
    invoice_number: invoiceNumber,
    total
  };
}

// ==================== CREATE INVOICE (orchestrator) ====================
async function createInvoice(data) {
  const { id_editor, production_ids } = data;
  const validRows = await fetchValidatedProductions(id_editor, production_ids);
  const total = calculateInvoiceTotal(validRows);
  return insertInvoice(id_editor, validRows, total);
}

module.exports = {
  getInvoicesByEditor,
  fetchValidatedProductions,
  calculateInvoiceTotal,
  insertInvoice,
  createInvoice
};