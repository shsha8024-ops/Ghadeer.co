const LS_KEY = 'ghadeer.secure.db';
const USER = 'admin';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

let state = null;
let passCache = null;

const defaultState = {
  clients:{},
  expenses:[]
};

/* ---------- Crypto Storage ---------- */
async function save(){
  const enc = await GCrypto.aesEncryptJson(state, passCache);
  localStorage.setItem(LS_KEY, JSON.stringify(enc));
}
async function load(pass){
  const raw = localStorage.getItem(LS_KEY);
  if(!raw){
    state = structuredClone(defaultState);
    passCache = pass;
    await save();
    return;
  }
  state = await GCrypto.aesDecryptJson(JSON.parse(raw), pass);
  passCache = pass;
}

/* ---------- Helpers ---------- */
const today=()=>new Date().toISOString().slice(0,10);
const uid=()=>Math.random().toString(36).slice(2);

/* ---------- UI ---------- */
function showApp(){
  $('#loginGate').classList.add('hidden');
  $('#app').classList.remove('hidden');
  $('#appHeader').classList.remove('hidden');
  $('#t_date').value=$('#e_date').value=today();
  renderAll();
}

function initTabs(){
  $$('#tabs .tab').forEach(b=>{
    b.onclick=()=>{
      $$('#tabs .tab').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      $$('.tab-pane').forEach(p=>p.classList.add('hidden'));
      $('#'+b.dataset.tab).classList.remove('hidden');
      renderAll();
    };
  });
}

/* ---------- Clients ---------- */
function renderClients(){
  const tbody=$('#clientRows'); tbody.innerHTML='';
  Object.values(state.clients).forEach(c=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${c.name}</td><td>${c.ledger.length}</td>
    <td><button onclick="delClient('${c.name}')">Delete</button></td>`;
    tbody.appendChild(tr);
  });
}
async function delClient(n){
  if(!confirm('Delete?'))return;
  delete state.clients[n]; await save(); renderAll();
}
async function addClient(){
  const n=$('#c_name').value.trim();
  if(!n)return;
  state.clients[n]={name:n,phone:'',city:'',ledger:[]};
  await save(); $('#c_name').value=''; renderAll();
}

/* ---------- Transactions ---------- */
function syncClients(){
  const s=$('#t_client'); s.innerHTML='';
  Object.keys(state.clients).forEach(n=>{
    const o=document.createElement('option');
    o.value=n;o.textContent=n;s.appendChild(o);
  });
}
async function addInvoice(){
  const c=$('#t_client').value;
  const a=+$('#t_amount').value;
  if(!c||!(a>0))return;
  state.clients[c].ledger.push({id:uid(),type:'invoice',amount:a});
  await save(); renderAll();
}

/* ---------- Expenses ---------- */
async function addExpense(){
  const a=+$('#e_amount').value;
  if(!(a>0))return;
  state.expenses.push({id:uid(),amount:a});
  await save(); renderAll();
}

/* ---------- Summary ---------- */
function renderSummary(){
  const inv=Object.values(state.clients)
    .flatMap(c=>c.ledger.filter(x=>x.type==='invoice'))
    .reduce((a,b)=>a+b.amount,0);
  const exp=state.expenses.reduce((a,b)=>a+b.amount,0);
  $('#s_totalInvoices').textContent=inv;
  $('#s_totalExpenses').textContent=exp;
  $('#s_netProfit').textContent=inv-exp;
}

function renderAll(){
  syncClients();
  renderClients();
  renderSummary();
}

/* ---------- Login ---------- */
window.addEventListener('DOMContentLoaded',()=>{
  initTabs();

  $('#loginBtn').onclick=async()=>{
    const u=$('#lg_user').value.trim();
    const p=$('#lg_pass').value.trim();
    if(u!==USER||!p){
      $('#lg_error').classList.remove('hidden'); return;
    }
    try{
      await load(p);
      showApp();
    }catch{
      $('#lg_error').classList.remove('hidden');
    }
  };

  $('#addClientBtn').onclick=addClient;
  $('#addInvoiceBtn').onclick=addInvoice;
  $('#addExpenseBtn').onclick=addExpense;
});

window.delClient=delClient;
