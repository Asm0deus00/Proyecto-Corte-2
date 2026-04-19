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
  dashboard:   { title: "Dashboard",   icon: "dashboard",   render: renderDashboard },
  productions: { title: "Productions", icon: "movie_edit",  render: renderProductions },
  clients:     { title: "Clients",     icon: "group",       render: renderClients },
  invoices:    { title: "Invoices",    icon: "receipt_long",render: renderInvoices },
  profile:     { title: "Profile",     icon: "person",      render: renderProfile }
};

function renderSidebar() {
  const nav = document.getElementById("sidebar-nav");

  nav.innerHTML = Object.keys(pages).map(key => `
    <a onclick="navigateTo('${key}')" id="nav-${key}" class="nav-link">
      <span class="material-symbols-outlined">${pages[key].icon}</span>
      ${pages[key].title}
    </a>
  `).join('');
}

function navigateTo(pageKey) {
  // Update active state
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
  const activeLink = document.getElementById(`nav-${pageKey}`);
  if (activeLink) activeLink.classList.add('active');

  const content = document.getElementById('main-content');
  content.innerHTML = '';

  // Header
  let actionBtn = '';
  if (pageKey === 'clients') {
    actionBtn = `<button class="header-btn" onclick="showNewClientModal()">
      <span class="material-symbols-outlined" style="font-size:16px">add</span> New Client
    </button>`;
  }
  if (pageKey === 'productions') {
    actionBtn = `<button class="header-btn" onclick="showNewProductionModal()">
      <span class="material-symbols-outlined" style="font-size:16px">add</span> New Production
    </button>`;
  }

  document.getElementById('top-header').innerHTML = `
    <div class="flex items-center gap-3">
      <h2 class="text-base font-700" style="font-weight:700; font-size:1.05rem;">${pages[pageKey].title}</h2>
    </div>
    <div>${actionBtn}</div>
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
    const completed = productions.filter(p => p.status === 'completed').length;

    container.innerHTML = `
      <!-- Stat Cards -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:16px; margin-bottom:32px;">
        <div class="stat-card">
          <div class="stat-icon"><span class="material-symbols-outlined">group</span></div>
          <div class="stat-label">Clients</div>
          <div class="stat-value">${clients.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><span class="material-symbols-outlined">movie_edit</span></div>
          <div class="stat-label">Productions</div>
          <div class="stat-value">${productions.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><span class="material-symbols-outlined">receipt_long</span></div>
          <div class="stat-label">Invoices</div>
          <div class="stat-value">${invoices.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><span class="material-symbols-outlined">payments</span></div>
          <div class="stat-label">Total Billed</div>
          <div class="stat-value">$${total.toLocaleString()}</div>
        </div>
      </div>

      <!-- Recent Invoices -->
      <div class="section-heading">Recent Invoices</div>

      ${invoices.length === 0 ? `
        <div class="empty-state">
          <span class="material-symbols-outlined">receipt_long</span>
          <p>No invoices yet. Complete a production and generate one.</p>
        </div>
      ` : `
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${invoices.map(i => `
            <div class="invoice-row" onclick="viewInvoice(${i.id_invoice})">
              <div style="width:36px;height:36px;border-radius:9px;background:rgba(105,97,255,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span class="material-symbols-outlined" style="font-size:18px;color:#6961ff">receipt_long</span>
              </div>
              <div style="flex:1;">
                <div style="font-weight:700;font-size:0.875rem;color:#e2e8f0;">Invoice #${i.id_invoice}</div>
              </div>
              <div style="font-weight:800;font-size:1rem;color:#34d399;">$${Number(i.total).toLocaleString()}</div>
              <span class="material-symbols-outlined" style="font-size:18px;color:#8888A0;">chevron_right</span>
            </div>
          `).join('')}
        </div>
      `}
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="empty-state"><span class="material-symbols-outlined">error</span><p>Error loading dashboard</p></div>`;
  }
}

// ==================== CLIENTS ====================
async function renderClients(container) {
  const clients = await apiRequest(`/clients?id_editor=${currentEditor.id_editor}`);

  if (!clients.length) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-outlined">group</span>
        <p>No clients yet. Add your first client to get started.</p>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="section-heading">${clients.length} client${clients.length !== 1 ? 's' : ''}</div>
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${clients.map(c => `
        <div class="vt-card">
          <div class="avatar">${c.name.charAt(0).toUpperCase()}</div>
          <div style="flex:1;">
            <div style="font-weight:700;font-size:0.9rem;color:#e2e8f0;">${c.name}</div>
            <div style="font-size:0.78rem;color:#8888A0;margin-top:2px;">${c.email || 'No email'}</div>
          </div>
          <span class="material-symbols-outlined" style="font-size:18px;color:#8888A0;">person</span>
        </div>
      `).join('')}
    </div>
  `;
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

function statusBadge(status) {
  const map = {
    pending:     ['badge badge-pending',  'Pending'],
    in_progress: ['badge badge-progress', 'In Progress'],
    completed:   ['badge badge-completed','Completed'],
  };
  const [cls, label] = map[status] || ['badge', status];
  return `<span class="${cls}">${label}</span>`;
}

async function renderProductions(container) {
  const productions = await apiRequest(`/productions?id_editor=${currentEditor.id_editor}`);

  if (!productions.length) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-outlined">movie_edit</span>
        <p>No productions yet. Create your first one.</p>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="section-heading">${productions.length} production${productions.length !== 1 ? 's' : ''}</div>
    <div style="background:#1A1A22;border:1px solid #2E2E3E;border-radius:14px;overflow:hidden;">
      <table class="vt-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Duration</th>
            <th>Price</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${productions.map(p => `
            <tr>
              <td style="font-weight:600;color:#e2e8f0;">${p.title}</td>
              <td style="color:#8888A0;">${p.video_type}</td>
              <td style="color:#8888A0;">${p.duration} min</td>
              <td style="font-weight:700;color:#34d399;">$${Number(p.price).toLocaleString()}</td>
              <td>
                <select class="status-select" onchange="updateStatus(${p.id_production}, this.value)">
                  <option value="pending"     ${p.status === 'pending'     ? 'selected' : ''}>Pending</option>
                  <option value="in_progress" ${p.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                  <option value="completed"   ${p.status === 'completed'   ? 'selected' : ''}>Completed</option>
                </select>
              </td>
              <td>
                <button class="icon-btn danger" onclick="deleteProduction(${p.id_production})" title="Delete">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

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

  const completed = productions.filter(p => p.status === 'completed');

  container.innerHTML = `
    <!-- Create Invoice section -->
    <div class="section-heading">Create Invoice</div>
    <div style="background:#1A1A22;border:1px solid #2E2E3E;border-radius:14px;padding:20px;margin-bottom:28px;">
      ${completed.length === 0 ? `
        <div style="color:#8888A0;font-size:0.875rem;padding:12px 0;">
          No completed productions available. Mark productions as completed first.
        </div>
      ` : `
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px;">
          ${completed.map(p => `
            <label style="display:flex;align-items:center;gap:12px;cursor:pointer;padding:10px 12px;border-radius:9px;transition:background 0.15s;" 
                   onmouseover="this.style.background='rgba(255,255,255,0.04)'" 
                   onmouseout="this.style.background='transparent'">
              <input type="checkbox" value="${p.id_production}" data-price="${p.price}" class="prod-check">
              <span style="flex:1;font-weight:600;font-size:0.875rem;color:#e2e8f0;">${p.title}</span>
              <span style="font-weight:700;color:#34d399;">$${Number(p.price).toLocaleString()}</span>
            </label>
          `).join('')}
        </div>
        <button class="header-btn" onclick="createInvoice()">
          <span class="material-symbols-outlined" style="font-size:16px">receipt_long</span>
          Generate Invoice
        </button>
      `}
    </div>

    <!-- Existing invoices -->
    <div class="section-heading">Invoices</div>
    ${invoices.length === 0 ? `
      <div class="empty-state">
        <span class="material-symbols-outlined">receipt_long</span>
        <p>No invoices created yet.</p>
      </div>
    ` : `
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${invoices.map(i => `
          <div class="invoice-row" onclick="viewInvoice(${i.id_invoice})">
            <div style="width:36px;height:36px;border-radius:9px;background:rgba(105,97,255,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <span class="material-symbols-outlined" style="font-size:18px;color:#6961ff">receipt_long</span>
            </div>
            <div style="flex:1;">
              <div style="font-weight:700;font-size:0.875rem;color:#e2e8f0;">Invoice #${i.id_invoice}</div>
            </div>
            <div style="font-weight:800;font-size:1rem;color:#34d399;">$${Number(i.total).toLocaleString()}</div>
            <span class="material-symbols-outlined" style="font-size:18px;color:#8888A0;">chevron_right</span>
          </div>
        `).join('')}
      </div>
    `}
  `;
}

async function createInvoice() {
  const checked = document.querySelectorAll('.prod-check:checked');
  
  if (checked.length === 0) {
    alert("Selecciona al menos una producción completada");
    return;
  }

  const productionIds = Array.from(checked).map(c => Number(c.value));

  try {
    const res = await apiRequest('/invoices', 'POST', {
      id_editor: currentEditor.id_editor,
      production_ids: productionIds
    });

    alert(`✅ Factura #${res.id_invoice} creada!\nTotal: $${res.total}`);
    navigateTo('invoices');
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
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
    <div class="profile-card">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
        <div class="avatar" style="width:52px;height:52px;font-size:1.3rem;border-radius:14px;">
          ${currentEditor.full_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style="font-weight:800;font-size:1.05rem;color:#e2e8f0;">${currentEditor.full_name}</div>
          <div style="font-size:0.8rem;color:#8888A0;margin-top:3px;">Video Editor</div>
        </div>
      </div>
      <div style="font-size:0.78rem;color:#8888A0;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Editor ID</div>
      <div style="font-size:0.875rem;color:#cbd5e1;margin-bottom:24px;">#${currentEditor.id_editor}</div>
    </div>
  `;
}

// ==================== UTILS ====================
async function updateStatus(id, status) {
  try {
    await apiRequest(`/productions/${id}`, 'PUT', { status });
    navigateTo('productions');
  } catch (err) {
    alert("Error updating status");
    console.error(err);
  }
}

function logout() {
  location.reload();
}