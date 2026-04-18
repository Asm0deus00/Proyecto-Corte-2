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

  if (!res.ok) throw new Error(await res.text());

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
    alert("Connection error");
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
    const [clients, productions, invoices] = await Promise.all([
      apiRequest(`/clients?id_editor=${currentEditor.id_editor}`),
      apiRequest(`/productions?id_editor=${currentEditor.id_editor}`),
      apiRequest(`/invoices?id_editor=${currentEditor.id_editor}`)
    ]);

    const total = invoices.reduce((sum, i) => sum + Number(i.total || 0), 0);

    container.innerHTML = `
      <p>Clients: ${clients.length}</p>
      <p>Productions: ${productions.length}</p>
      <p>Invoices: ${invoices.length}</p>
      <p>Total: $${total}</p>
    `;
  } catch {
    container.innerHTML = `<p>Error loading dashboard</p>`;
  }
}

// ==================== CLIENTS ====================
async function renderClients(container) {
  const clients = await apiRequest(`/clients?id_editor=${currentEditor.id_editor}`);

  container.innerHTML = clients.map(c => `
    <div>
      <b>${c.name}</b> (${c.email || 'no email'})
    </div>
  `).join('');
}

function showNewClientModal() {
  const name = prompt("Client name:");
  if (!name) return;

  createClient(name);
}

async function createClient(name) {
  await apiRequest('/clients', 'POST', {
    id_editor: currentEditor.id_editor,
    name
  });

  navigateTo('clients');
}

// ==================== PRODUCTIONS ====================
function showNewProductionModal() {
  const title = prompt("Title:");
  const duration = prompt("Duration (minutes):");
  const type = prompt("Type (social, corporate, etc):");
  const client = prompt("Client ID:");

  if (!title || !duration || !type || !client) return;

  createProduction(title, duration, type, client);
}

async function createProduction(title, duration, video_type, id_client) {
  const price = duration * 100;

  await apiRequest('/productions', 'POST', {
    id_editor: currentEditor.id_editor,
    id_client,
    title,
    video_type,
    duration,
    price,
    status: 'pending'
  });

  navigateTo('productions');
}

async function renderProductions(container) {
  const productions = await apiRequest(`/productions?id_editor=${currentEditor.id_editor}`);

  container.innerHTML = productions.map(p => `
    <div>
      <b>${p.title}</b> - ${p.video_type} - ${p.duration}min - $${p.price}
    </div>
  `).join('');
}

// ==================== INVOICES ====================
async function renderInvoices(container) {
  const invoices = await apiRequest(`/invoices?id_editor=${currentEditor.id_editor}`);

  container.innerHTML = invoices.map(i => `
    <div>
      Invoice #${i.id_invoice} - $${i.total}
    </div>
  `).join('');
}

// ==================== PROFILE ====================
function renderProfile(container) {
  container.innerHTML = `
    <p>${currentEditor.full_name}</p>
    <button onclick="logout()">Logout</button>
  `;
}

function logout() {
  location.reload();
}