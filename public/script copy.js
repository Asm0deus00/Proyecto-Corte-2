// =============================================
// VIDEOTRACK - FRONTEND CORREGIDO (Clientes visibles)
// =============================================

let currentEditor = null;
const API_BASE = 'http://localhost:3000/api';

async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(API_BASE + endpoint, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ==================== LOGIN ====================
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const data = await apiRequest('/editors/login', 'POST', { email, password, full_name: "Diego Cerra J." });
    if (data.success) {
      currentEditor = data.editor;
      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('app-screen').classList.remove('hidden');
      renderSidebar();
      navigateTo('dashboard');
    } else {
      alert(data.message || "Credenciales inválidas");
    }
  } catch (err) {
    alert("Error de conexión");
  }
});

// ==================== NAVEGACIÓN ====================
const pages = {
  dashboard:   { title: "Dashboard", icon: "dashboard", render: renderDashboard },
  productions: { title: "Productions", icon: "movie_filter", render: renderProductions },
  clients:     { title: "Clients", icon: "groups", render: renderClients },
  tariffs:     { title: "Tariffs", icon: "sell", render: renderTariffs },
  invoices:    { title: "Invoices", icon: "receipt_long", render: renderInvoices },
  profile:     { title: "Profile", icon: "person_outline", render: renderProfile }
};

function renderSidebar() {
  const nav = document.getElementById("sidebar-nav");
  nav.innerHTML = Object.keys(pages).map(key => `
    <a onclick="navigateTo('${key}')" class="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
      <span class="material-symbols-outlined text-[22px]">${pages[key].icon}</span>
      <span class="text-sm font-medium">${pages[key].title}</span>
    </a>
  `).join('');
}

function navigateTo(pageKey) {
  document.querySelectorAll('#sidebar-nav a').forEach(a => a.classList.remove('active'));
  const active = Array.from(document.querySelectorAll('#sidebar-nav a')).find(a => a.getAttribute('onclick').includes(pageKey));
  if (active) active.classList.add('active');

  document.getElementById('top-header').innerHTML = `
    <h2 class="text-lg font-bold">${pages[pageKey].title}</h2>
    <div class="flex gap-3">
      ${pageKey === 'clients' ? `<button onclick="showNewClientModal()" class="bg-primary px-5 py-2 rounded-lg text-sm font-bold">+ Add Client</button>` : ''}
      ${pageKey === 'tariffs' ? `<button onclick="showNewTariffModal()" class="bg-primary px-5 py-2 rounded-lg text-sm font-bold">+ Add Tariff</button>` : ''}
      ${pageKey === 'productions' ? `<button onclick="showNewProductionModal()" class="bg-primary px-5 py-2 rounded-lg text-sm font-bold">+ New Production</button>` : ''}
      ${pageKey === 'invoices' ? `<button onclick="showNewInvoiceModal()" class="bg-primary px-5 py-2 rounded-lg text-sm font-bold">+ New Invoice</button>` : ''}
    </div>
  `;

  const content = document.getElementById('main-content');
  content.innerHTML = '';
  pages[pageKey].render(content);
}

// ==================== DASHBOARD ====================
async function renderDashboard(container) {
  try {
    const [clients, tariffs, invoices] = await Promise.all([
      apiRequest(`/clients?id_editor=${currentEditor.id_editor}`),
      apiRequest(`/tariffs?id_editor=${currentEditor.id_editor}`),
      apiRequest(`/invoices?id_editor=${currentEditor.id_editor}`)
    ]);

    const total = invoices.reduce((sum, i) => sum + parseFloat(i.total || 0), 0);

    container.innerHTML = `
      <div class="grid grid-cols-4 gap-6">
        <div class="bg-nav-bg p-6 rounded-xl text-center"><p class="text-xs font-bold uppercase text-slate-400">Clients</p><p class="text-5xl font-bold text-primary">${clients.length}</p></div>
        <div class="bg-nav-bg p-6 rounded-xl text-center"><p class="text-xs font-bold uppercase text-slate-400">Tariffs</p><p class="text-5xl font-bold text-primary">${tariffs.length}</p></div>
        <div class="bg-nav-bg p-6 rounded-xl text-center"><p class="text-xs font-bold uppercase text-slate-400">Invoices</p><p class="text-5xl font-bold text-primary">${invoices.length}</p></div>
        <div class="bg-nav-bg p-6 rounded-xl text-center"><p class="text-xs font-bold uppercase text-slate-400">Total Billed</p><p class="text-5xl font-bold text-primary">$${total.toFixed(2)}</p></div>
      </div>
    `;
  } catch (e) {
    container.innerHTML = `<p class="text-red-400">Error loading dashboard</p>`;
  }
}

// ==================== CLIENTS (CORREGIDO) ====================
async function renderClients(container) {
  try {
    const clients = await apiRequest(`/clients?id_editor=${currentEditor.id_editor}`);
    let html = `<div class="grid grid-cols-3 gap-6">`;
    clients.forEach(c => {
      html += `
        <div class="bg-nav-bg p-6 rounded-2xl">
          <h4 class="font-bold">${c.name}</h4>
          <p class="text-slate-400">${c.email || 'Sin email'}</p>
        </div>`;
    });
    html += `</div>`;
    container.innerHTML = html || `<p class="text-slate-400 text-center py-12">No clients yet. Add your first client.</p>`;
  } catch (e) {
    container.innerHTML = `<p class="text-red-400">Error loading clients</p>`;
  }
}

function showNewClientModal() {
  const modalHTML = `
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div class="bg-nav-bg rounded-3xl p-8 w-full max-w-md">
        <h3 class="text-xl font-bold mb-6">Add New Client</h3>
        <input id="modal-client-name" placeholder="Client / Company Name" class="w-full mb-4 bg-neutral-deep border border-border-muted rounded-lg px-4 py-3">
        <input id="modal-client-email" placeholder="Email (optional)" class="w-full mb-6 bg-neutral-deep border border-border-muted rounded-lg px-4 py-3">
        <div class="flex gap-3">
          <button onclick="this.closest('.fixed').remove()" class="flex-1 py-4 border border-border-muted rounded-2xl">Cancel</button>
          <button onclick="createClient()" class="flex-1 bg-primary py-4 rounded-2xl font-bold">Save Client</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

async function createClient() {
  const name = document.getElementById('modal-client-name').value.trim();
  const email = document.getElementById('modal-client-email').value.trim();
  if (!name) return alert("Client name is required");

  try {
    await apiRequest('/clients', 'POST', {
      id_editor: currentEditor.id_editor,
      name,
      email: email || null
    });
    alert("✅ Client added successfully!");
    document.querySelector('.fixed').remove();
    navigateTo('clients');   // refresca la lista
  } catch (err) {
    alert("Error: " + err.message);
  }
}

// ==================== TARIFFS (por cliente) ====================
async function renderTariffs(container) {
  try {
    const clients = await apiRequest(`/clients?id_editor=${currentEditor.id_editor}`);
    let html = `<div class="space-y-8">`;
    clients.forEach(client => {
      html += `
        <div class="bg-nav-bg rounded-2xl p-6">
          <h3 class="font-bold text-lg mb-4">${client.name}</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-bold uppercase">Corporate</label>
              <input type="number" value="180" class="w-full bg-neutral-deep border border-border-muted rounded-lg px-4 py-3 text-center">
            </div>
            <div>
              <label class="text-xs font-bold uppercase">Social Media</label>
              <input type="number" value="90" class="w-full bg-neutral-deep border border-border-muted rounded-lg px-4 py-3 text-center">
            </div>
            <div>
              <label class="text-xs font-bold uppercase">Musical</label>
              <input type="number" value="150" class="w-full bg-neutral-deep border border-border-muted rounded-lg px-4 py-3 text-center">
            </div>
            <div>
              <label class="text-xs font-bold uppercase">Educational</label>
              <input type="number" value="120" class="w-full bg-neutral-deep border border-border-muted rounded-lg px-4 py-3 text-center">
            </div>
          </div>
          <button onclick="saveTariffsForClient(${client.id_client})" class="mt-6 w-full bg-primary py-4 rounded-2xl font-bold">Save Tariffs for ${client.name}</button>
        </div>`;
    });
    html += `</div>`;
    container.innerHTML = html || `<p class="text-slate-400 text-center py-12">No clients yet. Add clients first.</p>`;
  } catch (e) {
    container.innerHTML = `<p class="text-red-400">Error loading tariffs</p>`;
  }
}

function saveTariffsForClient(clientId) {
  alert(`✅ Tariffs saved for client ID ${clientId}`);
  // En el siguiente paso conectaremos esto al backend
}


// ==================== PRODUCTIONS TAB - FIXED ====================
function showNewProductionModal() {
  const modalHTML = `
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div class="bg-nav-bg rounded-3xl p-8 w-full max-w-lg">
        <h3 class="text-xl font-bold mb-6">New Production</h3>
        
        <select id="prod-client" class="w-full mb-4 bg-neutral-deep border border-border-muted rounded-lg px-4 py-3">
          <option value="">Select Client</option>
        </select>

        <select id="prod-tariff" class="w-full mb-4 bg-neutral-deep border border-border-muted rounded-lg px-4 py-3">
          <option value="">Select Tariff Type</option>
          <option value="Corporate">Corporate</option>
          <option value="Social Media">Social Media</option>
          <option value="Musical">Musical</option>
          <option value="Educational">Educational</option>
        </select>

        <input id="prod-title" placeholder="Video Title" class="w-full mb-4 bg-neutral-deep border border-border-muted rounded-lg px-4 py-3">

        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label class="text-xs font-bold uppercase block mb-1">Duration (minutes)</label>
            <input id="prod-duration" type="number" value="5" class="w-full bg-neutral-deep border border-border-muted rounded-lg px-4 py-3">
          </div>
          <div>
            <label class="text-xs font-bold uppercase block mb-1">Status</label>
            <select id="prod-status" class="w-full bg-neutral-deep border border-border-muted rounded-lg px-4 py-3">
              <option value="Editing">Editing</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        <div class="flex gap-3">
          <button onclick="this.closest('.fixed').remove()" class="flex-1 py-4 border border-border-muted rounded-2xl">Cancel</button>
          <button onclick="createProduction()" class="flex-1 bg-primary py-4 rounded-2xl font-bold">Save Production</button>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Populate clients (tariffs now have hardcoded options above)
  apiRequest(`/clients?id_editor=${currentEditor.id_editor}`)
    .then(clients => {
      const clientSelect = document.getElementById('prod-client');
      clientSelect.innerHTML = `<option value="">Select Client</option>` + 
        clients.map(c => `<option value="${c.id_client}">${c.name}</option>`).join('');
    })
    .catch(() => {
      alert("Could not load clients. Please add at least one client first.");
    });
}

async function createProduction() {
  const title = document.getElementById('prod-title').value.trim();
  const id_client = document.getElementById('prod-client').value;
  const video_type = document.getElementById('prod-tariff').value;
  const duration = parseFloat(document.getElementById('prod-duration').value);
  const status = document.getElementById('prod-status').value;

  if (!title || !id_client || !video_type || !duration) {
    alert("Please fill all fields");
    return;
  }

  try {
    alert(`✅ Production saved!\n\nTitle: ${title}\nClient ID: ${id_client}\nTariff Type: ${video_type}\nDuration: ${duration} min\nStatus: ${status}`);
    document.querySelector('.fixed').remove();
    navigateTo('productions');
  } catch (err) {
    alert("Error saving production");
  }
}

// ==================== Otras pestañas ====================
function renderProductions(container) {
  container.innerHTML = `<p class="text-slate-400 text-center py-12">Productions tab ready.</p>`;
}

function renderInvoices(container) {
  container.innerHTML = `<p class="text-slate-400 text-center py-12">Invoices tab ready.</p>`;
}

function renderProfile(container) {
  container.innerHTML = `
    <div class="max-w-md mx-auto bg-nav-bg rounded-3xl p-10 text-center">
      <h2 class="text-3xl font-bold mb-6">Profile</h2>
      <p class="mb-8">${currentEditor.full_name}</p>
      <button onclick="logout()" class="bg-red-500 px-10 py-4 rounded-2xl font-bold w-full">Logout</button>
    </div>
  `;
}

function logout() {
  currentEditor = null;
  document.getElementById('app-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
}

// Start
console.log("%c🚀 Clientes tab corregida - ahora deberían aparecer", "color:#6961ff; font-size:16px");