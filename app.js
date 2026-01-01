"use strict";

import { isLoggedIn, setLoggedIn, loadData, saveData } from "./storage.js";
import { renderAll } from "./ui.js";

const USER = "admin";
const PASS = "admin";

let data = loadData();
let snapshot = null;

document.addEventListener("DOMContentLoaded", () => {
  if (isLoggedIn()) unlock();

  document.getElementById("loginBtn").onclick = login;
  document.getElementById("logoutBtn").onclick = logout;
  document.getElementById("undoBtn").onclick = undo;

  document.getElementById("addClientBtn").onclick = addClient;
});

function login() {
  const u = lg_user.value;
  const p = lg_pass.value;
  if (u === USER && p === PASS) {
    setLoggedIn(true);
    unlock();
  } else {
    lg_error.classList.remove("hidden");
  }
}

function logout() {
  setLoggedIn(false);
  location.reload();
}

function unlock() {
  loginGate.classList.add("hidden");
  app.classList.remove("hidden");
  appHeader.classList.remove("hidden");
  renderAll(data);
}

function snap() {
  snapshot = JSON.stringify(data);
}

function undo() {
  if (!snapshot) return;
  data = JSON.parse(snapshot);
  saveData(data);
  renderAll(data);
}

function addClient() {
  snap();
  data.clients.push({
    id: Date.now(),
    name: c_name.value,
    phone: c_phone.value,
    city: c_city.value
  });
  saveData(data);
  renderAll(data);
}
