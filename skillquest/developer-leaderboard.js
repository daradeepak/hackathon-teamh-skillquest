(() => {
  const root = document.getElementById("app-main");
  if (!root) return;

  let requestNumber = 0;
  let refreshTimer = 0;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);

  const isLeaderboard = () => Boolean(
    root.querySelector(".xp-leaderboard-mount") &&
    document.querySelector('.nav-item.is-active[data-nav="leaderboard"]')
  );

  function makePanel() {
    const mount = root.querySelector(".xp-leaderboard-mount");
    if (!isLeaderboard() || !mount || mount.querySelector(".xp-leaderboard")) return;

    const panel = document.createElement("section");
    panel.className = "dev-panel xp-leaderboard";
    panel.setAttribute("aria-labelledby", "xp-leaderboard-title");
    panel.innerHTML = '<div class="dev-panel-head"><h3 id="xp-leaderboard-title">🏆 XPaddition leaderboard</h3><button class="xp-leaderboard-refresh" type="button" data-leaderboard-refresh aria-label="Refresh leaderboard" title="Refresh leaderboard">↻</button></div><p class="dev-muted">Registered players ranked by XP</p><div class="xp-leaderboard-list" role="list" aria-live="polite"><p class="dev-muted">Loading players…</p></div>';

    mount.appendChild(panel);

    panel.addEventListener("click", event => {
      if (event.target.closest("[data-leaderboard-refresh]")) loadPlayers(panel);
      if (event.target.closest("[data-leaderboard-login]")) document.getElementById("top-avatar")?.click();
    });
    loadPlayers(panel);
  }

  function showMessage(panel, message, action) {
    const list = panel.querySelector(".xp-leaderboard-list");
    if (!list) return;
    const button = action === "login"
      ? '<button class="xp-leaderboard-login" type="button" data-leaderboard-login>Sign in →</button>'
      : action === "retry"
        ? '<button class="xp-leaderboard-login" type="button" data-leaderboard-refresh>Try again →</button>'
        : "";
    list.innerHTML = '<div class="xp-leaderboard-empty"><span aria-hidden="true">🏅</span><p>' + escapeHtml(message) + '</p>' + button + '</div>';
  }

  async function loadPlayers(panel) {
    if (!panel.isConnected || !isLeaderboard()) return;
    const request = ++requestNumber;
    const list = panel.querySelector(".xp-leaderboard-list");
    if (list) list.innerHTML = '<p class="dev-muted">Loading players…</p>';

    try {
      const response = await fetch("/api/leaderboard", { headers: { "Accept": "application/json" }, cache: "no-store" });
      const result = await response.json();
      if (request !== requestNumber || !panel.isConnected) return;
      if (response.status === 401) return showMessage(panel, "Sign in to see registered players on the leaderboard.", "login");
      if (!response.ok) throw new Error(result.error || "The leaderboard could not load.");

      const players = Array.isArray(result.players) ? result.players : [];
      if (!players.length) return showMessage(panel, "No player accounts yet. Create an account and start earning XP.");
      list.innerHTML = players.map((player, index) => {
        const rankIcon = ["🥇", "🥈", "🥉"][index] || String(index + 1);
        const you = player.isCurrent ? '<span class="xp-leaderboard-you">YOU</span>' : "";
        const rowClass = "xp-leaderboard-row" + (player.isCurrent ? " is-you" : "");
        const xp = Number.isFinite(Number(player.xp)) ? Math.max(0, Number(player.xp)) : 0;
        return '<div class="' + rowClass + '" role="listitem"><span class="xp-leaderboard-rank">' + rankIcon + '</span><span class="xp-leaderboard-name"><strong>' + escapeHtml(player.name || "Player") + '</strong>' + you + '</span><strong class="xp-leaderboard-score">⚡ ' + xp.toLocaleString() + ' XP</strong></div>';
      }).join("");
    } catch (error) {
      if (request === requestNumber && panel.isConnected) showMessage(panel, error.message || "The leaderboard could not load.", "retry");
    }
  }

  const observer = new MutationObserver(() => makePanel());
  observer.observe(root, { childList: true, subtree: true });
  window.addEventListener("xpaddition:progress-saved", () => {
    const panel = root.querySelector(".xp-leaderboard");
    if (!panel || !isLeaderboard()) return;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => loadPlayers(panel), 350);
  });
})();
