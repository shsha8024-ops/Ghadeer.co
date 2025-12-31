
/* ---------- Crypto Storage ---------- */
/* ======================
   CONFIG
====================== */
const USER = "admin";
const PASS = "admin";
const LS_LOGIN = "ga_login";
const LS_DATA  = "ga_data";

/* ======================
   STATE
====================== */
let data = JSON.parse(localStorage.getItem(LS_DATA) || '{"clients":[],"invoices":[],"expenses":[]}');
let snapshot = null;

/* ======================
   LOGIN
====================== */
function login(){
  const u = document.getElementById("lu").value;
  const p = document.getElementById("lp").value;
  if(u === USER && p === PASS){
    localStorage.setItem(LS_LOGIN,"1");
    unlock();
  }else{
    document.getElementById("le").style.display="block";
  }
}
function logout(){
  localStorage.removeItem(LS_LOGIN);
  location.reload();
}
function unlock(){
  document.getElementById("login").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  document.getElementById("top").classList.remove("hidden");
  render();
}
if(localStorage.getItem(LS_LOGIN)==="1") unlock();

/* ======================
   NAV
====================== */
function tab(id){
  document.querySelectorAll("section").forEach(s=>s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

/* ======================
   HELPERS
====================== */
function save(){ localStorage.setItem(LS_DATA, JSON.stringify(data)); }
function snap(){ snapshot = JSON.stringify(data); }
function undo(){
  if(!snapshot) return alert("ماكو شي ترجع له");
  data = JSON.parse(snapshot);
  save(); render();
}
function uid(){ return Date.now()+Math.random(); }

/* ======================
   CLIENTS
====================== */
function addClient(){
  const name = c_name.value.trim();
  if(!name) return alert("اكتب اسم العميل");
  snap();
  data.clients.push({
    id: uid(),
    name,
    phone: c_phone.value,
    city: c_city.value
  });
  c_name.value=c_phone.value=c_city.value="";
  save(); render();
}
function delClient(id){
  snap();
  data.clients = data.clients.filter(c=>c.id!==id);
  data.invoices = data.invoices.filter(i=>i.client!==id);
  save(); render();
}

/* ======================
   INVOICES
====================== */
function addInvoice(){
  if(!i_client.value) return alert("اختر عميل");
  snap();
  data.invoices.push({
    id: uid(),
    client: +i_client.value,
    desc: i_desc.value,
    amount: +i_amount.value,
    date: i_date.value
  });
  i_desc.value=i_amount.value=i_date.value="";
  save(); render();
}
function delInvoice(id){
  snap();
  data.invoices = data.invoices.filter(i=>i.id!==id);
  save(); render();
}

/* ======================
   EXPENSES
====================== */
function addExpense(){
  snap();
  data.expenses.push({
    id: uid(),
    desc: e_desc.value,
    amount: +e_amount.value,
    date: e_date.value
  });
  e_desc.value=e_amount.value=e_date.value="";
  save(); render();
}
function delExpense(id){
  snap();
  data.expenses = data.expenses.filter(e=>e.id!==id);
  save(); render();
}

/* ======================
   RENDER
====================== */
function render(){
  // Clients
  clientsBody.innerHTML = data.clients.map(c=>
    `<tr>
      <td>${c.name}</td>
      <td><button onclick="delClient(${c.id})">✖</button></td>
    </tr>`
  ).join("");

  // Client select
  i_client.innerHTML = data.clients
    .map(c=>`<option value="${c.id}">${c.name}</option>`)
    .join("");

  // Invoices
  const iq = invSearch.value.toLowerCase();
  invoicesBody.innerHTML = data.invoices
    .filter(i=>i.desc.toLowerCase().includes(iq))
    .map(i=>`
      <tr>
        <td>${i.desc}</td>
        <td>${i.amount}</td>
        <td><button onclick="delInvoice(${i.id})">✖</button></td>
      </tr>
    `).join("");

  // Expenses
  const eq = expSearch.value.toLowerCase();
  expensesBody.innerHTML = data.expenses
    .filter(e=>e.desc.toLowerCase().includes(eq))
    .map(e=>`
      <tr>
        <td>${e.desc}</td>
        <td>${e.amount}</td>
        <td><button onclick="delExpense(${e.id})">✖</button></td>
      </tr>
    `).join("");

  // Summary
  const tin = data.invoices.reduce((s,x)=>s+x.amount,0);
  const tex = data.expenses.reduce((s,x)=>s+x.amount,0);
  s_in.textContent = tin;
  s_ex.textContent = tex;
  s_net.textContent = tin-tex;
}
invSearch.oninput = render;
expSearch.oninput = render;

/* ======================
   EXPORT / BACKUP
====================== */
function exportCSV(){
  let rows = [["Type","Description","Amount"]];
  data.invoices.forEach(i=>rows.push(["Invoice",i.desc,i.amount]));
  data.expenses.forEach(e=>rows.push(["Expense",e.desc,e.amount]));
  download(rows,"accounts.csv");
}
function download(rows,name){
  const csv = rows.map(r=>r.join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv]));
  a.download = name;
  a.click();
}
function backup(){
  download([[JSON.stringify(data)]],"backup.json");
}
function restore(){
  const f = restoreFile.files[0];
  if(!f) return;
  f.text().then(t=>{
    data = JSON.parse(t);
    save(); render();
  });
}

/* ======================
   PRINT PDF
====================== */
function printPDF(){
  const w = window.open("");
  w.document.write(`
    <h2>Summary</h2>
    <p>Invoices: ${s_in.textContent}</p>
    <p>Expenses: ${s_ex.textContent}</p>
    <p>Net: ${s_net.textContent}</p>
    <script>window.print()</script>
  `);
}

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
