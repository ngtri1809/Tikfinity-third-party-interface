const express = require("express");

const app = express();
const PORT = 8832;

const appInfo = {
  author: "@zerodytrash",
  name: "Shield Tracker",
  version: "1.0"
};

const categories = [
  {
    categoryId: "shield_tracking",
    categoryName: "Track Shield Milestones"
  }
];

const actionsByCategory = {
  shield_tracking: [
    {
      actionId: "increment_shield",
      actionName: "Increment Shield (10 rose milestone)"
    },
    {
      actionId: "reset_shield",
      actionName: "Reset Shield Counter"
    }
  ]
};

const shieldState = {
  count: 0,
  lastUpdatedAt: null
};

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  return next();
});

app.get("/api/app/info", (req, res) => {
  res.json({ data: appInfo });
});

app.get("/api/features/categories", (req, res) => {
  res.json({ data: categories });
});

app.get("/api/features/actions", (req, res) => {
  const categoryId = req.query.categoryId;

  if (!categoryId) {
    return res.status(400).json({ message: "categoryId is required." });
  }

  const actions = actionsByCategory[categoryId];
  if (!actions) {
    return res.status(404).json({ message: "Unknown categoryId." });
  }

  return res.json({ data: actions });
});

app.post("/api/features/actions/exec", (req, res) => {
  const { categoryId, actionId, context } = req.body || {};

  if (!categoryId || !actionId) {
    return res.status(400).json({ message: "categoryId and actionId are required." });
  }

  if (categoryId !== "shield_tracking") {
    return res.status(404).json({ message: "Unknown categoryId." });
  }

  if (actionId === "increment_shield") {
    const triggerTypeId = context?.triggerTypeId;
    const coins = Number(context?.coins ?? 0);

    if (triggerTypeId !== 3) {
      return res.json({
        message: "Ignored: shield increments only on gift triggers (triggerTypeId=3)."
      });
    }

    if (Number.isNaN(coins) || coins < 10) {
      return res.json({
        message: "Ignored: shield increments only when the gift milestone reaches 10 coins."
      });
    }

    shieldState.count += 1;
    shieldState.lastUpdatedAt = new Date().toISOString();

    return res.json({
      data: [],
      message: `Shield incremented. Current shield count: ${shieldState.count}.`
    });
  }

  if (actionId === "reset_shield") {
    shieldState.count = 0;
    shieldState.lastUpdatedAt = new Date().toISOString();
    return res.json({
      data: [],
      message: "Shield counter reset to 0."
    });
  }

  return res.status(404).json({ message: "Unknown actionId." });
});

app.get("/api/shield", (req, res) => {
  res.json({ data: shieldState });
});

const renderShieldWidget = (req, res) => {
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

app.get("/widget/shield", renderShieldWidget);
app.get("/widget/shield.html", renderShieldWidget);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`TikFinity third-party interface listening on port ${PORT}`);
});
