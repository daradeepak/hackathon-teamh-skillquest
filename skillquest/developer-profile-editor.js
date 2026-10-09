(function () {
  "use strict";

  var storageKey = "skillquest.profile.v1";
  var profile = { name: "", avatar: "" };
  var observer;

  try {
    profile = Object.assign(profile, JSON.parse(localStorage.getItem(storageKey) || "{}"));
  } catch (_error) {
    // The profile editor still works for this session if browser storage is unavailable.
  }

  function saveProfile() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(profile));
    } catch (_error) {
      // Keep the in-memory profile active if storage is full or blocked.
    }
  }

  function currentName() {
    return profile.name || (document.getElementById("profile-name") || {}).textContent || "Player";
  }

  function setText(element, value) {
    if (element && element.textContent !== value) element.textContent = value;
  }

  function setAvatar(element, label) {
    if (!element) return;
    var emojiAvatar = typeof profile.avatar === "string" && profile.avatar.indexOf("emoji:") === 0;
    if (!profile.avatar || emojiAvatar) {
      var avatarLabel = emojiAvatar ? profile.avatar.slice(6) : label;
      if (element.querySelector("img")) element.textContent = avatarLabel;
      else setText(element, avatarLabel);
      element.classList.remove("has-profile-photo");
      element.classList.toggle("has-profile-emoji", emojiAvatar);
      return;
    }

    var image = element.querySelector("img");
    if (!image) {
      element.replaceChildren();
      image = document.createElement("img");
      image.alt = "Profile picture";
      element.appendChild(image);
    }
    if (image.src !== profile.avatar) image.src = profile.avatar;
    element.classList.add("has-profile-photo");
    element.classList.remove("has-profile-emoji");
  }

  function wireAvatar(element) {
    if (!element || element.dataset.profileToggleBound) return;
    element.dataset.profileToggleBound = "true";
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
    element.setAttribute("aria-label", "Open player profile");
    element.setAttribute("title", "Open player profile");
    element.addEventListener("click", function () {
      var accountButton = document.getElementById("account-toggle");
      if (accountButton) accountButton.click();
    });
    element.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        element.click();
      }
    });
  }

  function applyProfile() {
    var name = currentName().trim() || "Player";
    setText(document.getElementById("profile-name"), name);
    setText(document.getElementById("account-toggle"), "Account · " + name);
    setText(document.querySelector(".account-profile-card strong"), name);

    var accountTitle = document.getElementById("account-title");
    var dialog = accountTitle && accountTitle.closest(".account-dialog");
    if (accountTitle && !(dialog && dialog.classList.contains("is-editing-profile"))) setText(accountTitle, "Hey, " + name + "!");

    var heading = document.querySelector("#app-main h1");
    if (heading && /^Nice work,/i.test(heading.textContent)) setText(heading, "Nice work, " + name + " ✨");
    var homeHeading = document.querySelector("#app-main h1");
    if (homeHeading && /^Hey\s+/i.test(homeHeading.textContent)) {
      setText(homeHeading, homeHeading.textContent.replace(/^Hey\s+[^!]+!/, "Hey " + name + "!"));
    }
    var mapGreeting = document.querySelector("#app-main .dev-map-intro strong");
    if (mapGreeting) setText(mapGreeting, "Hey, " + name + "!");

    var initials = name.split(/\s+/).map(function (part) { return part.charAt(0); }).join("").slice(0, 2).toUpperCase();
    var sidebarAvatar = document.getElementById("profile-avatar");
    var topAvatar = document.getElementById("top-avatar");
    setAvatar(sidebarAvatar, initials || "P");
    setAvatar(topAvatar, initials || "P");
    wireAvatar(sidebarAvatar);
    wireAvatar(topAvatar);
    var modalMark = document.querySelector(".account-dialog .account-mark");
    if (modalMark) setAvatar(modalMark, "🦊");
  }

  function readStats() {
    var accountSummary = document.querySelector(".account-profile-card small")?.textContent || "";
    var sidebarSummary = document.getElementById("profile-subtitle")?.textContent || "";
    var appText = document.getElementById("app-main")?.innerText || "";
    var levelMatch = accountSummary.match(/Level\s*(\d+)/i) || sidebarSummary.match(/Level\s*(\d+)/i);
    var xpMatch = accountSummary.match(/(\d+)\s*XP/i) || appText.match(/(\d+)\s*XP/i);
    var streakMatch = appText.match(/(?:🔥\s*)?(\d+)\s*day(?:s)?\s*streak/i) || appText.match(/🔥\s*(\d+)\s*days?/i);
    var comboMatch = appText.match(/×\s*(\d+)\s*(?:best\s+)?combo/i);
    return {
      level: levelMatch ? levelMatch[1] : "1",
      xp: xpMatch ? xpMatch[1] : "0",
      streak: streakMatch ? streakMatch[1] : "0",
      combo: comboMatch ? comboMatch[1] : "0"
    };
  }

  function addStats(dialog) {
    var stats = readStats();
    var items = [
      [stats.xp, "XP points"],
      [stats.level, "Level"],
      [stats.streak, "Day streak"],
      [stats.combo, "Best combo"]
    ];
    var grid = dialog.querySelector(".profile-stats-grid");
    if (!grid) {
      grid = document.createElement("div");
      grid.className = "profile-stats-grid";
    }
    items.forEach(function (item, index) {
      var cell = grid.children[index];
      if (!cell) {
        cell = document.createElement("div");
        cell.className = "profile-stat-cell";
        cell.append(document.createElement("strong"), document.createElement("span"));
        grid.appendChild(cell);
      }
      setText(cell.querySelector("strong"), item[0]);
      setText(cell.querySelector("span"), item[1]);
    });
    var card = dialog.querySelector(".account-profile-card");
    if (card && !grid.isConnected) card.insertAdjacentElement("afterend", grid);
  }

  function updatePreview(container) {
    container.replaceChildren();
    var emojiAvatar = typeof profile.avatar === "string" && profile.avatar.indexOf("emoji:") === 0;
    if (profile.avatar) {
      if (emojiAvatar) {
        container.textContent = profile.avatar.slice(6);
      } else {
        var image = document.createElement("img");
        image.src = profile.avatar;
        image.alt = "Profile picture preview";
        container.appendChild(image);
      }
    } else {
      var name = (document.querySelector('.profile-edit-form input[name="displayName"]') || {}).value || currentName();
      container.textContent = name.split(/\s+/).map(function (part) { return part.charAt(0); }).join("").slice(0, 2).toUpperCase() || "P";
    }
    container.classList.toggle("is-emoji-preview", emojiAvatar);
    var selectedAvatar = profile.avatar;
    container.closest(".profile-edit-form")?.querySelectorAll(".profile-avatar-option").forEach(function (button) {
      button.setAttribute("aria-pressed", button.dataset.avatar === selectedAvatar ? "true" : "false");
    });
  }

  function showEditor(dialog) {
    if (dialog.querySelector(".profile-edit-form")) return;
    var previousProfile = { name: profile.name, avatar: profile.avatar };
    dialog.classList.add("is-editing-profile");
    [".account-mark", ".account-kicker", ".account-intro", ".account-profile-card", ".profile-stats-grid", ".profile-edit-button", ".account-submit", ".account-local-note"].forEach(function (selector) {
      var element = dialog.querySelector(selector);
      if (element) element.hidden = true;
    });
    var title = dialog.querySelector("#account-title");
    setText(title, "Edit your player card");

    var form = document.createElement("form");
    form.className = "profile-edit-form";
    form.innerHTML = '<label class="profile-field-label">Display name<input name="displayName" type="text" maxlength="28" required autocomplete="nickname"></label>' +
      '<div class="profile-photo-field"><div class="profile-photo-preview" aria-label="Profile picture preview"></div><div class="profile-photo-actions"><label class="profile-upload-button">Choose profile picture<input name="avatarFile" type="file" accept="image/*"></label><button type="button" class="profile-clear-photo">Use initials</button><small>Stored only in this browser.</small></div></div>' +
      '<div class="profile-edit-actions"><button type="button" class="profile-cancel-button">Cancel</button><button type="submit" class="profile-save-button">Save profile</button></div>';
    form.querySelector('[name="displayName"]').value = currentName();
    var picker = document.createElement("div");
    picker.className = "profile-avatar-picker";
    picker.setAttribute("role", "group");
    picker.setAttribute("aria-label", "Choose an emoji avatar");
    var pickerLabel = document.createElement("span");
    pickerLabel.className = "profile-avatar-picker-label";
    pickerLabel.textContent = "Or pick an avatar";
    var options = document.createElement("div");
    options.className = "profile-avatar-options";
    picker.append(pickerLabel, options);
    ["🦊", "🐱", "🐼", "🐸", "🤖", "🚀", "🦄", "🐙"].forEach(function (emoji) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "profile-avatar-option";
      button.dataset.avatar = "emoji:" + emoji;
      button.textContent = emoji;
      button.setAttribute("aria-label", emoji + " avatar");
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", function () {
        profile.avatar = button.dataset.avatar;
        form.querySelector('[name="avatarFile"]').value = "";
        updatePreview(form.querySelector(".profile-photo-preview"));
      });
      options.appendChild(button);
    });
    form.querySelector(".profile-edit-actions").before(picker);
    form.querySelector('[name="displayName"]').addEventListener("input", function () {
      if (!profile.avatar) updatePreview(form.querySelector(".profile-photo-preview"));
    });
    form.querySelector('[name="avatarFile"]').addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file || !file.type.startsWith("image/")) return;
      var reader = new FileReader();
      reader.onload = function () {
        var image = new Image();
        image.onload = function () {
          var canvas = document.createElement("canvas");
          var scale = Math.min(1, 512 / Math.max(image.width, image.height));
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          profile.avatar = canvas.toDataURL("image/jpeg", 0.82);
          updatePreview(form.querySelector(".profile-photo-preview"));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
    form.querySelector(".profile-clear-photo").addEventListener("click", function () {
      profile.avatar = "";
      form.querySelector('[name="avatarFile"]').value = "";
      updatePreview(form.querySelector(".profile-photo-preview"));
    });
    function closeEditor(keepChanges) {
      if (!keepChanges) profile = Object.assign({ name: "", avatar: "" }, previousProfile);
      dialog.classList.remove("is-editing-profile");
      form.remove();
      title.hidden = false;
      setText(title, "Hey, " + currentName() + "!");
      [".account-mark", ".account-kicker", ".account-intro", ".account-profile-card", ".profile-stats-grid", ".profile-edit-button", ".account-submit", ".account-local-note"].forEach(function (selector) {
        var element = dialog.querySelector(selector);
        if (element) element.hidden = false;
      });
      addStats(dialog);
    }
    form.querySelector(".profile-cancel-button").addEventListener("click", function () { closeEditor(false); });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      profile.name = form.querySelector('[name="displayName"]').value.trim().slice(0, 28) || currentName();
      saveProfile();
      closeEditor(true);
      applyProfile();
    });
    dialog.querySelector(".profile-stats-grid")?.insertAdjacentElement("afterend", form);
    if (!dialog.querySelector(".profile-stats-grid")) dialog.querySelector(".account-profile-card")?.insertAdjacentElement("afterend", form);
    updatePreview(form.querySelector(".profile-photo-preview"));
  }

  function decorateDialog() {
    var dialog = document.querySelector(".account-dialog");
    if (!dialog) return;
    var editButton = dialog.querySelector(".profile-edit-button");
    if (!editButton) {
      editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "profile-edit-button";
      editButton.textContent = "✏️ Edit profile";
      var signOut = dialog.querySelector(".account-submit");
      if (signOut) signOut.insertAdjacentElement("beforebegin", editButton);
      editButton.addEventListener("click", function () { showEditor(dialog); });
    }
    if (!dialog.querySelector(".profile-edit-form")) addStats(dialog);
  }

  function addStyles() {
    if (document.getElementById("profile-editor-styles")) return;
    var style = document.createElement("style");
    style.id = "profile-editor-styles";
    style.textContent = `
      #profile-avatar.has-profile-photo, #top-avatar.has-profile-photo, .account-mark.has-profile-photo { overflow:hidden; padding:0; }
      #profile-avatar[role="button"], #top-avatar[role="button"] { cursor:pointer; }
      #profile-avatar[role="button"]:focus-visible, #top-avatar[role="button"]:focus-visible { outline:3px solid #7554d8; outline-offset:3px; }
      #profile-avatar img, #top-avatar img, .account-mark img { width:100%; height:100%; object-fit:cover; border-radius:inherit; display:block; }
      .account-dialog [hidden] { display:none !important; }
      .account-dialog .profile-edit-button { width:100%; min-height:48px; margin:12px 0 6px; border:0; border-radius:14px; background:#f0eaff; color:#5437a5; font-family:inherit; font-size:15px; font-weight:700; cursor:pointer; }
      .account-dialog .profile-stats-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; margin:14px 0; }
      .account-dialog .profile-stats-grid[hidden] { display:none !important; }
      .account-dialog .profile-stat-cell { min-height:62px; padding:10px 12px; border-radius:14px; background:#f7f4ff; display:flex; flex-direction:column; justify-content:center; gap:3px; }
      .account-dialog .profile-stat-cell strong { font-size:20px; line-height:1; color:#5e42bc; }
      .account-dialog .profile-stat-cell span { font-size:12px; font-weight:700; color:#6e6780; }
      .account-dialog .profile-edit-form { display:grid; gap:14px; margin:14px 0 4px; text-align:left; }
      .account-dialog .profile-field-label { display:grid; gap:7px; color:#554d69; font-weight:800; font-size:14px; }
      .account-dialog .profile-field-label input { width:100%; min-height:48px; box-sizing:border-box; border:2px solid #e4dcf7; border-radius:12px; padding:10px 12px; color:#31294a; background:white; font-family:inherit; font-size:16px; font-weight:600; }
      .account-dialog .profile-photo-field { display:flex; align-items:center; gap:14px; }
      .account-dialog .profile-photo-preview { width:68px; height:68px; flex:none; display:grid; place-items:center; border-radius:50%; overflow:hidden; background:#f0e5da; color:#6b452e; font-size:22px; font-weight:900; }
      .account-dialog .profile-photo-preview img { width:100%; height:100%; object-fit:cover; }
      .account-dialog .profile-photo-actions { display:flex; flex-wrap:wrap; align-items:center; gap:8px; }
      .account-dialog .profile-photo-preview.is-emoji-preview { background:#fff1c8; color:inherit; font-size:34px; font-weight:400; }
      .account-dialog .profile-avatar-picker { display:grid; gap:6px; }
      .account-dialog .profile-avatar-picker-label { color:#625977; font-size:13px; font-weight:700; }
      .account-dialog .profile-avatar-options { display:flex; flex-wrap:wrap; gap:7px; }
      .account-dialog .profile-avatar-option { width:38px; height:38px; padding:0; display:grid; place-items:center; border:2px solid transparent; border-radius:12px; background:#f5f0ff; font-family:inherit; font-size:21px; cursor:pointer; transition:transform .15s ease, border-color .15s ease, background .15s ease; }
      .account-dialog .profile-avatar-option:hover { transform:translateY(-2px); background:#eee5ff; }
      .account-dialog .profile-avatar-option[aria-pressed="true"] { border-color:#7554d8; background:#eee5ff; box-shadow:0 0 0 2px #7554d822; }
      .account-dialog .profile-avatar-option:focus-visible { outline:3px solid #7554d8; outline-offset:2px; }
      #profile-avatar.has-profile-emoji, #top-avatar.has-profile-emoji { font-size:1.05em; line-height:1; }
      .account-dialog .profile-upload-button, .account-dialog .profile-clear-photo, .account-dialog .profile-edit-actions button { display:inline-flex; align-items:center; justify-content:center; min-height:42px; padding:8px 12px; border:0; border-radius:12px; background:#f0eaff; color:#5437a5; font-family:inherit; font-size:13px; font-weight:700; cursor:pointer; }
      .account-dialog .profile-upload-button input { position:absolute; width:1px; height:1px; opacity:0; }
      .account-dialog .profile-photo-actions small { width:100%; color:#777084; font-size:11px; }
      .account-dialog .profile-edit-actions { display:flex; justify-content:flex-end; gap:9px; margin-top:4px; }
      .account-dialog .profile-edit-actions .profile-save-button { background:#6f4bd8; color:#fff; }
      @media(max-width:460px) { .account-dialog .profile-photo-field { align-items:flex-start; } .account-dialog .profile-edit-actions button { flex:1; } }
    `;
    document.head.appendChild(style);
  }

  function refresh() {
    addStyles();
    applyProfile();
    decorateDialog();
  }

  refresh();
  observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
