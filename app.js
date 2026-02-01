const loader = document.getElementById("loader");
const percentEl = document.getElementById("percent");
const newsRoot = document.getElementById("news");
const darkToggle = document.getElementById("darkToggle");
const menuItems = document.querySelectorAll(".menu-item");

const cAll = document.getElementById("c-all");
const cGlobal = document.getElementById("c-global");
const cTurkey = document.getElementById("c-turkey");
const cGames = document.getElementById("c-games");

let ALL_ITEMS = [];
let CURRENT_FILTER = "all";

/* ================= THEME ================= */
function applyTheme(){
  const t = localStorage.getItem("theme") || "dark";
  document.body.classList.toggle("light", t === "light");
  darkToggle.checked = t === "dark";
}
darkToggle.onchange = () => {
  localStorage.setItem("theme", darkToggle.checked ? "dark" : "light");
  applyTheme();
};
applyTheme();

/* ================= USER ================= */
function getUser(){
  return JSON.parse(localStorage.getItem("user")) || {
    likes:{}, dislikes:{}, read:{}
  };
}
function saveUser(d){
  localStorage.setItem("user", JSON.stringify(d));
}

/* ================= CACHE ================= */
function getCache(){
  return JSON.parse(localStorage.getItem("feedCache")) || [];
}
function saveCache(items){
  localStorage.setItem("feedCache", JSON.stringify(items));
}

/* ================= ACTIONS ================= */
window.like = id => {
  const u = getUser();
  if (u.likes[id]) {
    delete u.likes[id];
  } else {
    u.likes[id] = true;
    delete u.dislikes[id];
  }
  saveUser(u);
  updateActionUI(id);
};

window.dislike = id => {
  const u = getUser();
  if (u.dislikes[id]) {
    delete u.dislikes[id];
  } else {
    u.dislikes[id] = true;
    delete u.likes[id];
  }
  saveUser(u);
  updateActionUI(id);
};

window.openCard = (id, link) => {
  const u = getUser();
  u.read[id] = true;
  saveUser(u);
  document.querySelector(`[data-id="${id}"]`)?.classList.add("read");
  window.open(link, "_blank");
};

function updateActionUI(id){
  const card = document.querySelector(`[data-id="${id}"]`);
  if (!card) return;
  const u = getUser();
  card.querySelector(".like")?.classList.toggle("active", !!u.likes[id]);
  card.querySelector(".dislike")?.classList.toggle("active", !!u.dislikes[id]);
}

/* ================= FILTER ================= */
menuItems.forEach(item=>{
  item.onclick = () => {
    menuItems.forEach(i=>i.classList.remove("active"));
    item.classList.add("active");
    CURRENT_FILTER = item.dataset.filter;
    applyFilter();
  };
});

function applyFilter(){
  let items = ALL_ITEMS;
  if (CURRENT_FILTER==="global") items = items.filter(i=>i.category==="global");
  if (CURRENT_FILTER==="turkey") items = items.filter(i=>i.category==="turkey");
  if (CURRENT_FILTER==="games")
    items = items.filter(i=>i.type==="free-games"||i.type==="big-deals");
  render(items);
}

/* ================= COUNTS ================= */
function updateCounts(){
  cAll.textContent = ALL_ITEMS.length;
  cGlobal.textContent = ALL_ITEMS.filter(i=>i.category==="global").length;
  cTurkey.textContent = ALL_ITEMS.filter(i=>i.category==="turkey").length;
  cGames.textContent = ALL_ITEMS.filter(
    i=>i.type==="free-games"||i.type==="big-deals"
  ).length;
}

/* ================= LOADER ================= */
function smoothTo100(){
  let p = Number(percentEl.innerText.replace("%","")) || 90;
  const step = () => {
    if (p < 100) {
      p += 2;
      percentEl.innerText = p + "%";
      requestAnimationFrame(step);
    }
  };
  step();
}

/* ================= LOAD ================= */
async function load(){
  const cached = getCache();

  if (cached.length) {
    ALL_ITEMS = cached;
    updateCounts();
    loader.style.display = "none";
    newsRoot.style.display = "block";
    applyFilter();
  }

  let p = 0;
  const timer = setInterval(()=>{
    if (p < 90) {
      p += 5;
      percentEl.innerText = p + "%";
    }
  },100);

  try{
    const res = await fetch("/.netlify/functions/daily");
    const data = await res.json();
    clearInterval(timer);
    smoothTo100();

    const incoming = data.items || [];
    const existing = new Set(cached.map(i=>i.link));
    const newOnes = incoming.filter(i=>!existing.has(i.link));

    if (newOnes.length) {
      ALL_ITEMS = [...newOnes, ...cached];
      saveCache(ALL_ITEMS);
      updateCounts();
      applyFilter();
    }

    setTimeout(()=>{
      loader.style.display="none";
      newsRoot.style.display="block";
    },300);

  } catch {
    clearInterval(timer);
    loader.style.display="none";
    newsRoot.style.display="block";
  }
}

/* ================= RENDER ================= */
function render(items){
  const u = getUser();
  newsRoot.innerHTML = "";

  items.forEach(it=>{
    const div = document.createElement("div");
    const isRead = !!u.read[it.link];
    const liked = !!u.likes[it.link];
    const disliked = !!u.dislikes[it.link];

    div.className =
      "card "+
      (it.type==="free-games"?"free":it.type==="big-deals"?"deal":"news")+
      (isRead?" read":"");

    div.dataset.id = it.link;

    const img = it.image ? `<img src="${it.image}" loading="lazy">` : "";

    div.innerHTML = `
      <div class="source">${it.source}</div>
      <div class="title">${it.title}</div>
      ${img}
      <div class="desc">${it.summary || ""}</div>
      <div class="actions">
        <button class="like ${liked?"active":""}" onclick="like('${it.link}')">👍</button>
        <button class="dislike ${disliked?"active":""}" onclick="dislike('${it.link}')">👎</button>
        <button onclick="openCard('${it.link}','${it.link}')">Oku</button>
      </div>
    `;
    newsRoot.appendChild(div);
  });
}

load();
