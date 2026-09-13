const state = { alerts: [], selectedId: null };
const rows = document.querySelector('#alertRows');
const severityFilter = document.querySelector('#severityFilter');
const statusFilter = document.querySelector('#statusFilter');

function escapeHtml(value) {
  return String(value).replace(/[&<>\"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#039;' }[character]));
}

function formatDate(value) { return new Date(value).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }); }
function severityBadge(severity) { return `<span class="badge badge-${severity.toLowerCase()}">${escapeHtml(severity)}</span>`; }

function renderRows() {
  const severity = severityFilter.value;
  const status = statusFilter.value;
  const filtered = state.alerts.filter((alert) => (!severity || alert.severity === severity) && (!status || alert.status === status));
  document.querySelector('#resultCount').textContent = `${filtered.length} records`;
  rows.innerHTML = filtered.length ? filtered.map((alert) => `<tr data-id="${escapeHtml(alert.id)}" class="${alert.id === state.selectedId ? 'selected' : ''}"><td>${severityBadge(alert.severity)}</td><td><span class="alert-id">${escapeHtml(alert.id)}</span><span class="subtext">${escapeHtml(alert.technique)}</span></td><td>${escapeHtml(alert.hostname)}</td><td>${escapeHtml(alert.tactic)}</td><td class="status">${escapeHtml(alert.status.replace('_', ' '))}</td><td>${formatDate(alert.created_timestamp)}</td></tr>`).join('') : '<tr><td colspan="6" class="empty">No alerts match these filters.</td></tr>';
  rows.querySelectorAll('tr[data-id]').forEach((row) => row.addEventListener('click', () => selectAlert(row.dataset.id)));
}

function selectAlert(id) {
  state.selectedId = id;
  const alert = state.alerts.find((item) => item.id === id);
  if (!alert) return;
  document.querySelector('#detailPanel').innerHTML = `<p class="eyebrow">Alert detail</p><h2>${escapeHtml(alert.id)}</h2><div class="detail-grid"><div><p class="detail-label">Severity</p><p class="detail-value">${severityBadge(alert.severity)}</p></div><div><p class="detail-label">Status</p><p class="detail-value">${escapeHtml(alert.status.replace('_', ' '))}</p></div><div><p class="detail-label">Hostname</p><p class="detail-value">${escapeHtml(alert.hostname)}</p></div><div><p class="detail-label">Tactic</p><p class="detail-value">${escapeHtml(alert.tactic)}</p></div></div><hr class="detail-divider"><p class="detail-label">Technique</p><p class="detail-value">${escapeHtml(alert.technique)}</p><p class="detail-label">Description</p><p class="detail-value">${escapeHtml(alert.description)}</p><p class="detail-label">Created</p><p class="detail-value">${formatDate(alert.created_timestamp)}</p>`;
  renderRows();
}

async function loadAlerts() {
  rows.innerHTML = '<tr><td colspan="6" class="empty">Loading alert stream...</td></tr>';
  const query = new URLSearchParams({ limit: '100' });
  if (severityFilter.value) query.set('severity', severityFilter.value);
  if (statusFilter.value) query.set('status', statusFilter.value);
  try {
    const response = await fetch(`/api/alerts?${query}`);
    if (!response.ok) throw new Error('API unavailable');
    const payload = await response.json();
    state.alerts = payload.data;
    document.querySelector('#totalMetric').textContent = state.alerts.length;
    document.querySelector('#criticalMetric').textContent = state.alerts.filter((alert) => alert.severity === 'CRITICAL').length;
    document.querySelector('#highMetric').textContent = state.alerts.filter((alert) => alert.severity === 'HIGH').length;
    document.querySelector('#openMetric').textContent = state.alerts.filter((alert) => alert.status !== 'closed').length;
    renderRows();
  } catch (error) {
    rows.innerHTML = '<tr><td colspan="6" class="empty">API unavailable. Start alerts-api and check the HTTP route.</td></tr>';
  }
}

severityFilter.addEventListener('change', loadAlerts);
statusFilter.addEventListener('change', loadAlerts);
document.querySelector('#refreshButton').addEventListener('click', loadAlerts);
loadAlerts();
