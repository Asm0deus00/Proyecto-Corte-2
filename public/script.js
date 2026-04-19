let currentEditor = null;
const API_BASE = 'http://localhost:3000/api';

// ==================== API ====================
async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };

  if (body) options.body = JSON.stringify(body);

  const res = await fetch(API_BASE + endpoint, options);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("API ERROR:", errorText);
    throw new Error(errorText);
  }

  return res.json();
}

// ==================== LOGIN ====================
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const data = await apiRequest('/editors/login', 'POST', {
      email,
      password,
      full_name: "Demo User"
    });

    if (data.success) {
      currentEditor = data.editor;

      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('app-screen').classList.remove('hidden');

      renderSidebar();
      navigateTo('dashboard');
    } else {
      alert("Invalid credentials");
    }
  } catch (err) {
    alert("Login error");
    console.error(err);
  }
});

// ==================== NAV ====================
const pages = {
  dashboard:   { title: "Dashboard", render: renderDashboard },
  productions: { title: "Productions", render: renderProductions },
  clients:     { title: "Clients", render: renderClients },
  invoices:    { title: "Invoices", render: renderInvoices },
  profile:     { title: "Profile", render: renderProfile }
};

function renderSidebar() {
  const nav = document.getElementById("sidebar-nav");

  nav.innerHTML = Object.keys(pages).map(key => `
    <a onclick="navigateTo('${key}')" class="block p-3 cursor-pointer">
      ${pages[key].title}
    </a>
  `).join('');
}

function navigateTo(pageKey) {
  const content = document.getElementById('main-content');
  content.innerHTML = '';

  document.getElementById('top-header').innerHTML = `
    <h2>${pages[pageKey].title}</h2>
    ${pageKey === 'clients' ? `<button onclick="showNewClientModal()">+ Client</button>` : ''}
    ${pageKey === 'productions' ? `<button onclick="showNewProductionModal()">+ Production</button>` : ''}
  `;

  pages[pageKey].render(content);
}

// ==================== DASHBOARD ====================
async function renderDashboard(container) {
  try {
    const clients = await apiRequest(`/clients?id_editor=${currentEditor.id_editor}`);
    const productions = await apiRequest(`/productions?id_editor=${currentEditor.id_editor}`);
    const invoices = await apiRequest(`/invoices?id_editor=${currentEditor.id_editor}`);

    const total = invoices.reduce((sum, i) => sum + Number(i.total || 0), 0);

    container.innerHTML = `
      <p>Clients: ${clients.length}</p>
      <p>Productions: ${productions.length}</p>
      <p>Invoices: ${invoices.length}</p>
      <p><b>Total Billed:</b> $${total}</p>

      <hr>

      <h3>Invoices</h3>

      ${invoices.length === 0 ? `
        <p>No invoices yet</p>
      ` : invoices.map(i => `
        <div 
          onclick="viewInvoice(${i.id_invoice})" 
          style="cursor:pointer; border:1px solid #ccc; padding:10px; margin:5px 0;"
        >
          <b>Invoice #${i.id_invoice}</b> - $${i.total}
        </div>
      `).join('')}
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p>Error loading dashboard</p>`;
  }
}

// ==================== CLIENTS ====================
async function renderClients(container) {
  const clients = await apiRequest(`/clients?id_editor=${currentEditor.id_editor}`);

  if (!clients.length) {
    container.innerHTML = `<p>No clients yet</p>`;
    return;
  }

  container.innerHTML = clients.map(c => `
    <div>
      <b>${c.name}</b> (${c.email || 'no email'})
    </div>
  `).join('');
}

function showNewClientModal() {
  const name = prompt("Client name:");
  const email = prompt("Email (optional):");

  if (!name) return;

  createClient(name, email);
}

async function createClient(name, email) {
  try {
    await apiRequest('/clients', 'POST', {
      id_editor: currentEditor.id_editor,
      name,
      email: email || null
    });

    navigateTo('clients');
  } catch (err) {
    console.error(err);
    alert("Error creating client");
  }
}

// ==================== PRODUCTIONS ====================
async function showNewProductionModal() {
  try {
    const clients = await apiRequest(`/clients?id_editor=${currentEditor.id_editor}`);

    if (!clients.length) {
      alert("You must create a client first.");
      return;
    }

    const clientList = clients.map(c => `${c.id_client}: ${c.name}`).join('\n');

    const title = prompt("Title:");
    const duration = prompt("Duration (minutes):");
    const type = prompt("Type (social, corporate, etc):");
    const status = prompt("Status (pending, completed, etc):") || "pending";
    const client = prompt("Select Client ID:\n" + clientList);

    if (!title || !duration || !type || !client) return;

    createProduction(title, duration, type, client, status);

  } catch (err) {
    console.error(err);
    alert("Error loading clients");
  }
}

async function createProduction(title, duration, video_type, id_client, status) {
  duration = Number(duration);
  id_client = Number(id_client);

  if (!duration || !id_client) {
    alert("Invalid data");
    return;
  }

  const price = duration * 100;

  try {
    await apiRequest('/productions', 'POST', {
      id_editor: currentEditor.id_editor,
      id_client,
      title,
      video_type,
      duration,
      price,
      status
    });

    navigateTo('productions');

  } catch (err) {
    console.error(err);
    alert("Error saving production");
  }
}

// 🔥 UPDATED: now includes DELETE button
async function renderProductions(container) {
  const productions = await apiRequest(`/productions?id_editor=${currentEditor.id_editor}`);

  if (!productions.length) {
    container.innerHTML = `<p>No productions yet</p>`;
    return;
  }

  container.innerHTML = productions.map(p => `
  <div>
    <b>${p.title}</b> - ${p.video_type} - ${p.duration}min - $${p.price}
    
    <select onchange="updateStatus(${p.id_production}, this.value)">
      <option value="pending" ${p.status === 'pending' ? 'selected' : ''}>Pending</option>
      <option value="in_progress" ${p.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
      <option value="completed" ${p.status === 'completed' ? 'selected' : ''}>Completed</option>
    </select>

    <button onclick="deleteProduction(${p.id_production})">Delete</button>
  </div>
`).join('');
}

// 🔥 NEW FUNCTION (added, not replacing anything)
async function deleteProduction(id) {
  if (!confirm("Delete this production?")) return;

  try {
    await apiRequest(`/productions/${id}`, 'DELETE');
    navigateTo('productions');
  } catch (err) {
    console.error(err);
    alert("Error deleting production");
  }
}

// ==================== INVOICES ====================
async function renderInvoices(container) {
  const productions = await apiRequest(`/productions?id_editor=${currentEditor.id_editor}`);
  const invoices = await apiRequest(`/invoices?id_editor=${currentEditor.id_editor}`);

  // Only completed productions
  const completed = productions.filter(p => p.status === 'completed');

  container.innerHTML = `
    <h3>Create Invoice</h3>

    ${completed.map(p => `
      <div>
        <input 
        type="checkbox" 
        value="${p.id_production}" 
        data-price="${p.price}"
        class="prod-check"
      >
        ${p.title} - $${p.price}
      </div>
    `).join('')}

    <button onclick="createInvoice()">Generate Invoice</button>

    <hr>

    <h3>Existing Invoices</h3>
    ${invoices.map(i => `
      <div onclick="viewInvoice(${i.id_invoice})" style="cursor:pointer;">
        Invoice #${i.id_invoice} - $${i.total}
      </div>
    `).join('')}
  `;
}

async function createInvoice() {
  const checked = document.querySelectorAll('.prod-check:checked');

  if (checked.length === 0) {
    alert("Select at least one production");
    return;
  }

  // ✅ Get IDs as array (not string)
  const productionIds = Array.from(checked).map(c => Number(c.value));

  // ✅ Calculate total properly
  let total = 0;
  checked.forEach(c => {
    total += Number(c.dataset.price || 0);
  });

  try {
    const res = await apiRequest('/invoices', 'POST', {
      id_editor: currentEditor.id_editor,
      production_ids: productionIds,   // ✅ FIXED KEY
      total: total                     // ✅ SEND TOTAL
    });

    alert("Invoice created. Total: $" + total);

    navigateTo('invoices');

  } catch (err) {
    alert("Error creating invoice");
    console.error(err);
  }
}

async function viewInvoice(id) {
  const invoices = await apiRequest(`/invoices?id_editor=${currentEditor.id_editor}`);
  const invoice = invoices.find(i => i.id_invoice === id);

  if (!invoice) return;

  const ids = invoice.production_ids || invoice.productions_ids || [];

  alert(`
Invoice #${invoice.id_invoice}
Productions: ${Array.isArray(ids) ? ids.join(', ') : ids}
Total: $${invoice.total}
  `);
}

// ==================== PROFILE ====================
function renderProfile(container) {
  container.innerHTML = `
    <p>${currentEditor.full_name}</p>
    <button onclick="logout()">Logout</button>
  `;
}

async function updateStatus(id, status) {
  try {
    await apiRequest(`/productions/${id}`, 'PUT', { status });

    navigateTo('productions'); // refresh view
  } catch (err) {
    alert("Error updating status");
    console.error(err);
  }
}

function logout() {
  location.reload();
}