:root{
  --bg:#f5f7fb;
  --card:#fff;
  --primary:#4f7cff;
  --danger:#ff5a5a;
}

body{margin:0;font-family:Tahom;background:var(--bg)}
.hidden{display:none}
header{background:#fff;padding:10px;display:flex;justify-content:space-between}
nav button{margin:2px;padding:8px;border-radius:8px;border:1px solid #ddd}
nav button.active{background:var(--primary);color:#fff}
.card{background:var(--card);padding:16px;margin:12px;border-radius:14px}
input,select{width:100%;padding:10px;margin-bottom:8px}
button.primary{background:var(--primary);color:#fff;border:0;padding:10px}
button.danger{background:var(--danger);color:#fff;border:0;padding:8px}
table{width:100%}
td{padding:8px;border-bottom:1px solid #eee}

/* Login */
.login,.splash{
  position:fixed;inset:0;
  display:flex;align-items:center;justify-content:center;
}
.splash{
  background:linear-gradient(135deg,#4f7cff,#6d5cff);
  color:#fff;
  z-index:9999;
  animation:fadeOut .6s ease forwards;
  animation-delay:1.4s;
}
@keyframes fadeOut{to{opacity:0;visibility:hidden}}