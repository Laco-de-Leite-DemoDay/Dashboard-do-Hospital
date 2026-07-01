const lots = [
  { id: "L-2048", donor: "Ana Paula", liters: 3.4, hoursToExpire: 18, idleHours: 42, status: "expiring" },
  { id: "L-2051", donor: "Camila Rocha", liters: 2.1, hoursToExpire: 36, idleHours: 18, status: "expiring" },
  { id: "L-2039", donor: "Mariana Souza", liters: 4.6, hoursToExpire: 96, idleHours: 72, status: "stalled" },
  { id: "L-2054", donor: "Beatriz Lima", liters: 1.8, hoursToExpire: 64, idleHours: 55, status: "stalled" },
  { id: "L-2056", donor: "Julia Martins", liters: 5.2, hoursToExpire: 120, idleHours: 8, status: "ok" },
  { id: "L-2059", donor: "Patricia Alves", liters: 2.9, hoursToExpire: 144, idleHours: 12, status: "ok" },
  { id: "L-2062", donor: "Renata Costa", liters: 3.1, hoursToExpire: 72, idleHours: 10, status: "ok" },
  { id: "L-2064", donor: "Fernanda Dias", liters: 1.6, hoursToExpire: 48, idleHours: 22, status: "ok" }
];

const donors = [
  { name: "Ana Paula", area: "Bairro Norte", available: "3,4 L", profile: "Prematuro extremo", score: 98, status: "Apta" },
  { name: "Camila Rocha", area: "Jardim Sol", available: "2,1 L", profile: "Baixo peso", score: 92, status: "Apta" },
  { name: "Mariana Souza", area: "Centro", available: "4,6 L", profile: "UTI neonatal", score: 88, status: "Revisar exames" },
  { name: "Renata Costa", area: "Vila Nova", available: "3,1 L", profile: "Recem-nascido clinico", score: 81, status: "Apta" }
];

const recipients = [
  { name: "RN Helena", unit: "UTI Neo 2", need: "1,2 L hoje", priority: "Critica", score: 99 },
  { name: "RN Miguel", unit: "UTI Neo 1", need: "900 ml hoje", priority: "Alta", score: 94 },
  { name: "RN Laura", unit: "Alojamento Canguru", need: "700 ml", priority: "Alta", score: 87 },
  { name: "RN Theo", unit: "Pediatria", need: "500 ml", priority: "Media", score: 73 }
];

const units = [
  ["UTI Neo 1", "3 receptoras", "Alta demanda"],
  ["UTI Neo 2", "4 receptoras", "Critica"],
  ["Canguru", "2 receptoras", "Estavel"],
  ["Pediatria", "1 receptora", "Monitorar"]
];

const sensors = [
  ["Freezer A", "-18,4 C", "Estavel"],
  ["Freezer B", "-17,9 C", "Estavel"],
  ["Caixa rota 12", "3,6 C", "Em transporte"],
  ["Sala pasteurizacao", "22,1 C", "Dentro do limite"]
];

let activeFilter = "all";
let actions = [
  "Separar L-2048 para RN Helena",
  "Notificar coleta no Bairro Norte",
  "Enviar L-2039 para pasteurizacao final"
];

const numberFormat = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

function formatLiters(value) {
  return `${numberFormat.format(value)} L`;
}

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"));
  document.querySelector(`#${screenId}`).classList.add("active");
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.screen === screenId);
  });
  document.querySelector("#pageTitle").textContent = document.querySelector(`#${screenId}`).dataset.title;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderKpis() {
  const total = lots.reduce((sum, lot) => sum + lot.liters, 0);
  const expiring = lots.filter((lot) => lot.hoursToExpire <= 48).reduce((sum, lot) => sum + lot.liters, 0);
  const stalled = lots.filter((lot) => lot.idleHours >= 40).reduce((sum, lot) => sum + lot.liters, 0);

  document.querySelector("#milkAvailable").textContent = formatLiters(total);
  document.querySelector("#expiringMilk").textContent = formatLiters(expiring);
  document.querySelector("#stalledMilk").textContent = formatLiters(stalled);
  document.querySelector("#suggestedMatches").textContent = donors.length.toString();
  document.querySelector("#actionCount").textContent = `${actions.length} pendentes`;
}

function getAlertCopy(lot) {
  if (lot.hoursToExpire <= 24) {
    return {
      kind: "critical",
      title: `${lot.id} vence em ${lot.hoursToExpire}h`,
      text: `${lot.donor} | ${formatLiters(lot.liters)} liberados para uso imediato`
    };
  }

  if (lot.hoursToExpire <= 48) {
    return {
      kind: "warning",
      title: `${lot.id} proximo da validade`,
      text: `${lot.donor} | priorizar em ate 48h`
    };
  }

  return {
    kind: "warning",
    title: `${lot.id} parado ha ${lot.idleHours}h`,
    text: `${lot.donor} | revisar fluxo de distribuicao`
  };
}

function renderAlerts() {
  const list = document.querySelector("#alertList");
  const query = document.querySelector("#searchInput").value.trim().toLowerCase();
  const alertLots = lots.filter((lot) => lot.hoursToExpire <= 48 || lot.idleHours >= 40);
  const filtered = alertLots.filter((lot) => {
    const byFilter = activeFilter === "all" || lot.status === activeFilter;
    const bySearch = `${lot.id} ${lot.donor}`.toLowerCase().includes(query);
    return byFilter && bySearch;
  });

  list.innerHTML = filtered.map((lot) => {
    const alert = getAlertCopy(lot);
    return `
      <article class="alert-item">
        <span class="alert-level ${alert.kind === "critical" ? "critical" : ""}"></span>
        <div>
          <strong>${alert.title}</strong>
          <small>${alert.text}</small>
        </div>
        <button class="mini-action" type="button" data-action="resolve" data-lot="${lot.id}">Decidir</button>
      </article>
    `;
  }).join("");

  if (!filtered.length) {
    list.innerHTML = '<div class="feed-item"><span class="step-number">0</span><div><strong>Nenhum alerta encontrado</strong><small>Ajuste a busca ou o filtro atual.</small></div></div>';
  }
}

function renderStockChart() {
  const chart = document.querySelector("#stockChart");
  const maxLiters = Math.max(...lots.map((lot) => lot.liters));

  chart.innerHTML = lots.map((lot) => {
    const percent = Math.round((lot.liters / maxLiters) * 100);
    const tone = lot.hoursToExpire <= 24 ? "danger" : lot.hoursToExpire <= 48 || lot.idleHours >= 40 ? "warn" : "";
    return `
      <div class="stock-row">
        <strong>${lot.id}</strong>
        <div class="bar-track"><div class="bar ${tone}" style="width: ${percent}%"></div></div>
        <small>${formatLiters(lot.liters)}</small>
      </div>
    `;
  }).join("");
}

function renderPeople() {
  document.querySelector("#donorList").innerHTML = donors.map((donor) => `
    <article class="person-card">
      <div>
        <strong>${donor.name}</strong>
        <small>${donor.area} | ${donor.available} | ${donor.profile} | ${donor.status}</small>
      </div>
      <span class="score">${donor.score}</span>
    </article>
  `).join("");

  document.querySelector("#recipientList").innerHTML = recipients.map((recipient) => `
    <article class="table-row">
      <div>
        <strong>${recipient.name}</strong>
        <small>${recipient.unit} | ${recipient.need} | prioridade ${recipient.priority}</small>
      </div>
      <span class="score">${recipient.score}</span>
    </article>
  `).join("");
}

function renderRoutes() {
  const steps = [
    ["Coleta", "Ana Paula, Bairro Norte, prioridade por validade"],
    ["Processamento", "Laboratorio confirma rastreio e temperatura"],
    ["Entrega", "UTI Neo 2 recebe lote L-2048 para RN Helena"]
  ];

  document.querySelector("#routeSteps").innerHTML = steps.map(([title, text], index) => `
    <article class="route-step">
      <span class="step-number">${index + 1}</span>
      <div><strong>${title}</strong><small>${text}</small></div>
    </article>
  `).join("");
}

function renderActions() {
  document.querySelector("#actionFeed").innerHTML = actions.map((action, index) => `
    <article class="feed-item">
      <span class="step-number">${index + 1}</span>
      <div><strong>${action}</strong><small>Registro criado no prontuario operacional</small></div>
    </article>
  `).join("");
  document.querySelector("#actionCount").textContent = `${actions.length} pendentes`;
}

function renderDashboardDetails() {
  document.querySelector("#criticalTimeline").innerHTML = [
    ["08:40", "RN Helena precisa receber L-2048 antes da validade critica"],
    ["09:15", "Confirmar exames da doadora Mariana Souza"],
    ["10:20", "Coleta externa com cadeia fria em rota"]
  ].map(([time, text], index) => `
    <article class="timeline-item">
      <span class="step-number">${index + 1}</span>
      <div><strong>${time}</strong><small>${text}</small></div>
    </article>
  `).join("");

  document.querySelector("#unitGrid").innerHTML = units.map(([name, volume, status]) => `
    <article class="unit-card">
      <strong>${name}</strong>
      <small>${volume}</small>
      <small>${status}</small>
    </article>
  `).join("");

  document.querySelector("#sensorList").innerHTML = sensors.map(([name, value, status]) => `
    <article class="sensor-row">
      <div><strong>${name}</strong><small>${status}</small></div>
      <span class="status-pill accent">${value}</span>
    </article>
  `).join("");
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function bindEvents() {
  document.querySelector("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const unit = document.querySelector("#unit").value;
    document.querySelector("#loggedUnit").textContent = unit;
    document.querySelector("#loginScreen").classList.add("hidden");
    document.querySelector("#appShell").classList.remove("hidden");
    showToast("Acesso medico liberado.");
  });

  document.querySelector("#logoutBtn").addEventListener("click", () => {
    document.querySelector("#appShell").classList.add("hidden");
    document.querySelector("#loginScreen").classList.remove("hidden");
  });

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => showScreen(button.dataset.screen));
  });

  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".segment").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      activeFilter = button.dataset.filter;
      renderAlerts();
    });
  });

  document.querySelector("#searchInput").addEventListener("input", renderAlerts);

  document.querySelector("#alertList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='resolve']");
    if (!button) return;
    const lotId = button.dataset.lot;
    actions.unshift(`Decisao registrada para ${lotId}`);
    renderActions();
    renderKpis();
    showToast(`${lotId} enviado para a fila prioritaria.`);
  });

  document.querySelector("#optimizeBtn").addEventListener("click", () => {
    donors.sort((a, b) => b.score - a.score);
    recipients.sort((a, b) => b.score - a.score);
    actions.unshift("Prioridades recalculadas por validade, risco clinico e distancia");
    renderPeople();
    renderActions();
    renderKpis();
    showToast("Prioridades hospitalares otimizadas.");
  });

  document.querySelector("#assignBestBtn").addEventListener("click", () => {
    actions.unshift("Rota acionada: Ana Paula -> Laboratorio -> UTI Neo 2");
    document.querySelector("#routeEta").textContent = "28 min";
    renderActions();
    renderKpis();
    showToast("Melhor rota acionada com estimativa de 28 minutos.");
  });

  document.querySelector("#newDonorBtn").addEventListener("click", () => {
    donors.unshift({ name: "Nova doadora", area: "Triagem inicial", available: "0,0 L", profile: "Cadastro pendente", score: 65, status: "Triagem" });
    actions.unshift("Nova doadora aberta para triagem");
    renderPeople();
    renderActions();
    renderKpis();
    showToast("Cadastro de doadora criado para triagem.");
  });
}

function init() {
  renderKpis();
  renderAlerts();
  renderStockChart();
  renderPeople();
  renderRoutes();
  renderActions();
  renderDashboardDetails();
  bindEvents();
}

init();
