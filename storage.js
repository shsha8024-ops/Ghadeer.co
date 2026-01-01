"use strict";

const LS_LOGIN = "ga_login";
const LS_DATA  = "ga_data";

export function isLoggedIn() {
  return localStorage.getItem(LS_LOGIN) === "1";
}

export function setLoggedIn(val) {
  if (val) localStorage.setItem(LS_LOGIN, "1");
  else localStorage.removeItem(LS_LOGIN);
}

export function loadData() {
  try {
    return JSON.parse(localStorage.getItem(LS_DATA)) || {
      clients: [],
      invoices: [],
      expenses: []
    };
  } catch {
    return { clients: [], invoices: [], expenses: [] };
  }
}

export function saveData(data) {
  localStorage.setItem(LS_DATA, JSON.stringify(data));
}
