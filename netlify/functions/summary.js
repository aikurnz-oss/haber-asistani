const loader = document.getElementById("loader");
const progress = document.getElementById("progress");
const content = document.getElementById("content");

let p = 0;
const timer = setInterval(() => {
  if (p < 85) {
    p += 5;
    progress.innerText = "%" + p;
  }
}, 60);

function getCachedFeed() {
  try {
    return JSON.parse(localStorage.getItem("cachedFeed_v2")) || [];
  } catch {
    return [];
  }
}

function renderSummary() {
  const items = getCachedFeed();

  clearInterval(timer);
  progress.innerText = "%100";
  loader.style.display = "none";
  content.style.display = "block";
  content.innerHTML = "";

  if (!items.length) {
    content.innerHTML = "<p>Özet için önce akışı aç.</p>";
    return;
  }

  const selected = items.filter(i =>
    i.type === "free-games" ||
    i.type === "big-deals" ||
    i.category === "global"
  ).slice(0, 7);

  if (!selected.length) {
    content.innerHTML = "<p>Bugün kritik bir gelişme yok.</p>";
    return;
  }

  selected.forEach(i => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div class="title">${i.title}</div>
      <div class="desc">${i.summary || "Detay için akışa bak."}</div>
    `;
    content.appendChild(div);
  });
}

// DOM hazır → çalış
renderSummary();
