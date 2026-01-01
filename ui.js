"use strict";

export function renderAll(data) {
  renderClients(data);
  renderInvoices(data);
  renderExpenses(data);
  renderSummary(data);
}

function renderClients(data) {
  const tbody = document.getElementById("clientRows");
  tbody.innerHTML = data.clients.map(c => `
    <tr>
      <td>${c.name}</td>
      <td><button data-id="${c.id}">✖</button></td>
    </tr>
  `).join("");
}

function renderInvoices(data) {
  const tbody = document.getElementById("invoiceRows");
  tbody.innerHTML = data.invoices.map(i => `
    <tr>
      <td>${i.desc}</td>
      <td>${i.amount}</td>
    </tr>
  `).join("");
}

function renderExpenses(data) {
  const tbody = document.getElementById("expenseRows");
  tbody.innerHTML = data.expenses.map(e => `
    <tr>
      <td>${e.desc}</td>
      <td>${e.amount}</td>
    </tr>
  `).join("");
}

function renderSummary(data) {
  const tin = data.invoices.reduce((s,x)=>s+x.amount,0);
  const tex = data.expenses.reduce((s,x)=>s+x.amount,0);
  document.getElementById("s_totalInvoices").textContent = tin;
  document.getElementById("s_totalExpenses").textContent = tex;
  document.getElementById("s_netProfit").textContent = tin - tex;
}
