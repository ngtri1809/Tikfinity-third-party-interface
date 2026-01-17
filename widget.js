const renderShieldWidget = (req, res, shieldState) => {
  const label = req.query.label || "Shield Count";
  const refreshSeconds = Number(req.query.refreshSeconds ?? 5);
  const refreshInterval = Number.isNaN(refreshSeconds) || refreshSeconds < 1 ? 5 : refreshSeconds;

  res.type("html").send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="refresh" content="${refreshInterval}" />
    <title>Shield Counter</title>
    <style>
      :root {
        color-scheme: dark;
      }
      body {
        margin: 0;
        padding: 0;
        font-family: "Inter", "Segoe UI", system-ui, sans-serif;
        background: transparent;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
      }
      .widget {
        background: rgba(12, 12, 12, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        padding: 18px 26px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      }
      .label {
        font-size: 14px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 8px;
      }
      .value {
        font-size: 48px;
        font-weight: 700;
        line-height: 1;
      }
      .controls {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin-top: 14px;
      }
      .btn {
        border: none;
        border-radius: 999px;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 600;
        color: #111;
        background: #f7d047;
        cursor: pointer;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .btn.secondary {
        background: #f1f1f1;
      }
      .btn:active {
        transform: scale(0.96);
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .updated {
        margin-top: 6px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
      }
    </style>
  </head>
  <body>
    <div class="widget">
      <div class="label">${label}</div>
      <div class="value" id="shield-value">${shieldState.count}</div>
      <div class="controls">
        <button class="btn secondary" id="shield-decrement" type="button">-1</button>
        <button class="btn" id="shield-increment" type="button">+1</button>
      </div>
      <div class="updated" id="shield-updated">Updated ${shieldState.lastUpdatedAt ?? "just now"}</div>
    </div>
    <script>
      const valueEl = document.getElementById("shield-value");
      const updatedEl = document.getElementById("shield-updated");
      const incrementBtn = document.getElementById("shield-increment");
      const decrementBtn = document.getElementById("shield-decrement");

      const setLoading = (isLoading) => {
        incrementBtn.disabled = isLoading;
        decrementBtn.disabled = isLoading;
      };

      const updateUI = (data) => {
        if (!data) {
          return;
        }
        valueEl.textContent = data.count;
        updatedEl.textContent = `Updated ${data.lastUpdatedAt ?? "just now"}`;
      };

      const adjustShield = async (endpoint) => {
        try {
          setLoading(true);
          const response = await fetch(endpoint, { method: "POST" });
          const payload = await response.json();
          updateUI(payload.data);
        } catch (error) {
          updatedEl.textContent = "Update failed.";
        } finally {
          setLoading(false);
        }
      };

      incrementBtn.addEventListener("click", () => adjustShield("/api/shield/increment"));
      decrementBtn.addEventListener("click", () => adjustShield("/api/shield/decrement"));
    </script>
  </body>
</html>`);
};

module.exports = {
  renderShieldWidget
};
