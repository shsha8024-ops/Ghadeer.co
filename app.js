// app.js — Clean Edition (No Login)

const LS_KEY = 'ghadeer.data.bundle.v1';
const DEFAULT_PASS = 'local-pass'; // ثابت محلي فقط

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

let decryptedState = null;

const defaultState = {
  clients: {},
  expenses: [],
  settings: { currency: 'USD', locale: 'en-US' }
};

/* ------------------ Storage ------------------ */
async function initStorage(){
  const raw = localStorage.getItem(LS_KEY);
  if(raw){
    decryptedState = await GCrypto.aesDecryptJson(JSON.parse(raw), DEFAULT_PASS);
  }else{
    decryptedState = structuredClone(defaultState);
    await save();
  }
}

async function save(){
  const bundle = await GCrypto.aesEncryptJson(decryptedState, DEFAULT_PASS);
  localStorage.setItem(LS_KEY, JSON.stringify(bundle));
}

/* ------------------ Helpers ------------------ */
const today = () => new Date().toISOString().slice(0,10);
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const sum = a => a.reduce((x,y)=>x+Number(y||0),0);

function fmt(n){
  const {locale,currency} = decryptedState.settings;
  try{
    return Number(n).toLocaleString(locale,{style:'currency',currency});
  }catch{
    return Number(n).toLocaleString(locale)+' '+currency;
  }
}

function calcClientBalance(name){
  const c = decryptedState.clients[name];
  if(!c) return 0;
  return c.ledger.reduce((b,o)=> b + (o.type==='invoice'?+o.amount:-o.amount),0);
}

/* ------------------ Tabs ------------------ */
function initTabs(){
  $$('#tabs .tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      $$('#tabs .tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      $$('.tab-pane').forEach(p=>p.classList.add('hidden'));
      $('#'+btn.dataset.tab).classList.remove('hidden');
      renderAll();
    });
  });
}

/* ------------------ Clients ------------------ */
function syncClientSelects(){
  ['t_client','p_client'].forEach(id=>{
    const el = $('#'+id);
    el.innerHTML='';
    Object.keys(decryptedState.clients).forEach(n=>{
      const o=document.createElement('option');
      o.value=n; o.textContent=n;
      el.appendChild(o);
    });
  });
}

function renderClients(){
  const tbody = $('#clientRows');
  tbody.innerHTML='';
  Object.values(decryptedState.clients).forEach(c=>{
    const bal = calcClientBalance(c.name);
    const tr=document.createElement('tr');
    tr.innerHTML=`
      <td>${c.name}</td>
      <td>${c.phone||'-'}</td>
      <td>${c.city||'-'}</td>
      <td>${c.ledger.length}</td>
      <td>${fmt(bal)}</td>
      <td>
        <button onclick="openStatement('${c.name}')">كشف</button>
        <button onclick="deleteClient('${c.name}')">حذف</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

async function deleteClient(name){
  if(!confirm('حذف العميل وكل عملياته؟')) return;
  delete decryptedState.clients[name];
  await save();
  renderAll();
}

/* ------------------ Add Actions ------------------ */
async function addClient(){
  const name=$('#c_name').value.trim();
  if(!name) return alert('اسم العميل مطلوب');
  decryptedState.clients[name]={
    name,
    phone:$('#c_phone').value.trim(),
    city:$('#c_city').value.trim(),
    ledger:[]
  };
  await save();
  $('#c_name').value=$('#c_phone').value=$('#c_city').value='';
  renderAll();
}

async function addInvoice(){
  const c=$('#t_client').value;
  const amount=+$('#t_amount').value;
  if(!c||!(amount>0)) return;
  decryptedState.clients[c].ledger.push({
    id:uid(),type:'invoice',
    desc:$('#t_desc').value,
    amount,date:$('#t_date').value||today()
  });
  await save();
  renderAll();
}

async function addPayment(){
  const c=$('#p_client').value;
  const amount=+$('#p_amount').value;
  if(!c||!(amount>0)) return;
  decryptedState.clients[c].ledger.push({
    id:uid(),type:'payment',
    desc:$('#p_desc').value,
    amount,date:$('#p_date').value||today()
  });
  await save();
  renderAll();
}

async function addExpense(){
  const amount=+$('#e_amount').value;
  if(!(amount>0)) return;
  decryptedState.expenses.push({
    id:uid(),desc:$('#e_desc').value,
    amount,date:$('#e_date').value||today()
  });
  await save();
  renderAll();
}

/* ------------------ Summary ------------------ */
function renderSummary(){
  const all=Object.values(decryptedState.clients);
  const invoices=sum(all.flatMap(c=>c.ledger.filter(x=>x.type==='invoice').map(x=>x.amount)));
  const payments=sum(all.flatMap(c=>c.ledger.filter(x=>x.type==='payment').map(x=>x.amount)));
  const expenses=sum(decryptedState.expenses.map(e=>e.amount));
  $('#s_totalInvoices').textContent=fmt(invoices);
  $('#s_totalPayments').textContent=fmt(payments);
  $('#s_totalExpenses').textContent=fmt(expenses);
  $('#s_netProfit').textContent=fmt(invoices-expenses);
}

/* ------------------ Render ------------------ */
function renderAll(){
  syncClientSelects();
  renderClients();
  renderSummary();
}

/* ------------------ Init ------------------ */
window.addEventListener('DOMContentLoaded', async ()=>{
  await initStorage();
  initTabs();

  $('#t_date').value=$('#p_date').value=$('#e_date').value=today();

  $('#addClientBtn').onclick=addClient;
  $('#addInvoiceBtn').onclick=addInvoice;
  $('#addPaymentBtn').onclick=addPayment;
  $('#addExpenseBtn').onclick=addExpense;

  renderAll();
});

/* ------------------ Expose ------------------ */
window.openStatement = name => alert('كشف الحساب قادم 👀');
window.deleteClient = deleteClient;