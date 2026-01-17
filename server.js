const express = require("express");

const { renderShieldWidget } = require("./widget");

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

app.get("/widget/shield", (req, res) => renderShieldWidget(req, res, shieldState));
app.get("/widget/shield.html", (req, res) => renderShieldWidget(req, res, shieldState));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`TikFinity third-party interface listening on port ${PORT}`);
});
