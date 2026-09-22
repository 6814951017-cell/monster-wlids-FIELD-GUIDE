const API_URL = window.localStorage.getItem("apiUrl") || "http://localhost:5000/api";
const state = { resource: "monsters", game: "", query: "", page: 1, pages: 1 };
const results = document.querySelector("#results");
const status = document.querySelector("#status");
const loadMore = document.querySelector("#loadMore");
const searchInput = document.querySelector("#searchInput");
const dialog = document.querySelector("#detailDialog");

const readable = (value) => String(value || "—").replaceAll("-", " ");
const titleCase = (value) => readable(value).replace(/\b\w/g, (letter) => letter.toUpperCase());

async function request(path) {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) throw new Error(response.status === 0 ? "API is unavailable" : `Request failed (${response.status})`);
  return response.json();
}

function summary(entry) {
  const values = {
    monsters: `${titleCase(entry.classification)} · ${entry.species || "Unknown species"}`,
    weapons: `${titleCase(entry.weaponType)}`,
    armors: `${titleCase(entry.rank)} rank · ${entry.pieces?.length || 0} pieces`,
    quests: `${titleCase(entry.rank)} rank · ${titleCase(entry.questType)}`,
    items: `${titleCase(entry.category)} · Rarity ${entry.rarity ?? "—"}`,
  };
  return values[state.resource] || "";
}

function nameOf(entry) { return entry.name || entry.setName || entry.title || "Untitled"; }
function kindOf(entry) { return entry.classification || entry.weaponType || entry.rank || entry.category || entry.questType || "Entry"; }

function card(entry) {
  const node = document.createElement("button");
  node.className = "card";
  const imgHtml = entry.image ? `<img src="${entry.image}" alt="" class="-mx-5 -mt-5 mb-5 h-28 w-[calc(100%+2.5rem)] object-cover" />` : '';
  node.innerHTML = imgHtml + `<span class="kind">${state.resource.slice(0, -1)}</span><span class="badge">${titleCase(kindOf(entry))}</span><h3>${nameOf(entry)}</h3><p>${summary(entry)}</p>`;
  node.addEventListener("click", () => showDetail(entry));
  return node;
}

function showDetail(entry) {
  const ignored = ["_id", "__v", "createdAt", "updatedAt", "image", "game", "slug"];
  const list = Object.entries(entry).filter(([key, value]) => !ignored.includes(key) && value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `<li><b>${titleCase(key)}</b> ${Array.isArray(value) ? value.map((item) => typeof item === "object" ? item.name || item.setName || item.element || JSON.stringify(item) : item).join(", ") : typeof value === "object" ? value.name || value.setName || JSON.stringify(value) : value}</li>`).join("");
  document.querySelector("#detailContent").innerHTML = `<p class="eyebrow">${state.resource.slice(0, -1)}</p><h2 class="detail-title">${nameOf(entry)}</h2><ul class="detail-list">${list}</ul>`;
  dialog.showModal();
}

async function loadEntries(append = false) {
  status.textContent = append ? "Loading more entries…" : "Loading field notes…";
  const params = new URLSearchParams({ page: state.page, limit: 12 });
  if (state.game) params.set("game", state.game);
  if (state.query) params.set("q", state.query);
  try {
    const { data, pagination } = await request(`/${state.resource}?${params}`);
    if (!append) results.replaceChildren();
    if (!data.length && !append) results.innerHTML = '<div class="empty">No entries found. Try a different game or search term.</div>';
    data.forEach((entry) => results.append(card(entry)));
    state.pages = pagination.pages;
    loadMore.hidden = state.page >= state.pages;
    status.textContent = `${pagination.total} ${state.resource} found`;
  } catch (error) {
    results.innerHTML = `<div class="empty"><b>Could not reach the API.</b><br />Start the server at <code>http://localhost:5000</code>, then refresh this page.</div>`;
    status.textContent = error.message;
    loadMore.hidden = true;
  }
}

async function loadGames() {
  try {
    const { data } = await request("/games?limit=100");
    const select = document.querySelector("#gameSelect");
    data.forEach((game) => select.add(new Option(game.title, game._id)));
  } catch { /* The entry view already gives a clear server error. */ }
}

document.querySelectorAll(".tabs button").forEach((button) => button.addEventListener("click", () => {
  document.querySelector(".tabs .active").classList.remove("active");
  button.classList.add("active"); state.resource = button.dataset.resource; state.page = 1; loadEntries();
}));
document.querySelector("#gameSelect").addEventListener("change", (event) => { state.game = event.target.value; state.page = 1; loadEntries(); });
let typingTimer;
searchInput.addEventListener("input", (event) => { clearTimeout(typingTimer); typingTimer = setTimeout(() => { state.query = event.target.value.trim(); state.page = 1; loadEntries(); }, 250); });
loadMore.addEventListener("click", () => { state.page += 1; loadEntries(true); });
document.querySelector(".close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });

loadGames();
loadEntries();
