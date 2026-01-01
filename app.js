"use strict";

const USER = "admin";
const PASS = "admin";
const LS = "ga_data";

let data = JSON.parse(localStorage.getItem(LS)) || {
  clients: [],
  invoices: [],
  expenses: []
};

// DOM
const $ = id => document.getElementById(id);
const loginGate = $("loginGate");
const app = $("app");
const appHeader = $("appHeader");

// LOGIN
$("loginBtn").addEventListener("click", () => {
  const u = $("lg_user").value;
  const p = $("lg_pass").value;
  if (u === USER && p === PASS) unlock();
  else $("lg_error").classList.remove("hidden");
});

$("logoutBtn").addEventListener("click", () => location.reload());

function unlock(){
  loginGate.classList.add("hidden");
  app.classList.remove("hidden");
  appHeader.classList.remove("hidden");
  render();
}

// TABS
document.querySelectorAll("[data-tab]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll("section").forEach(s=>s.classList.add("hidden"));
    $(btn.dataset.tab).classList.remove("hidden");
  });
});

// CLIENTS
$("addClientBtn").addEventListener("click", ()=>{
  data.clients.push({id:Date.now(),name:$("c_name").value});
  $("c_name").value="";
  save(); render();
});

// INVOICES
$("addInvoiceBtn").addEventListener("click", ()=>{
  data.invoices.push({
    id:Date.now(),
    client:$("i_client").value,
    desc:$("i_desc").value,
    amount:+$("i_amount").value
  });
  save(); render();
});

// EXPENSES
$("addExpenseBtn").addEventListener("click", ()=>{
  data.expenses.push({
    id:Date.now(),
    desc:$("e_desc").value,
    amount:+$("e_amount").value
  });
  save(); render();
});

function save(){
  localStorage.setItem(LS, JSON.stringify(data));
}

function render(){
  $("clientRows").innerHTML = data.clients.map(c=>`<tr><td>${c.name}</td></tr>`).join("");
  $("i_client").innerHTML = data.clients.map(c=>`<option value="${c.id}">${c.name}</option>`).join("");
  $("invoiceRows").innerHTML = data.invoices.map(i=>`<tr><td>${i.desc}</td><td>${i.amount}</td></tr>`).join("");
  $("expenseRows").innerHTML = data.expenses.map(e=>`<tr><td>${e.desc}</td><td>${e.amount}</td></tr>`).join("");

  const tin = data.invoices.reduce((s,x)=>s+x.amount,0);
  const tex = data.expenses.reduce((s,x)=>s+x.amount,0);
  $("s_in").textContent = tin;
  $("s_ex").textContent = tex;
  $("s_net").textContent = tin - tex;
}
