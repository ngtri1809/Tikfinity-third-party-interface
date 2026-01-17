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
      <div class="value">${shieldState.count}</div>
      <div class="updated">Updated ${shieldState.lastUpdatedAt ?? "just now"}</div>
    </div>
  </body>
</html>`);
};

module.exports = {
  renderShieldWidget
};
