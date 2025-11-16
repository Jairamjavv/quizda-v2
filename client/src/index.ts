import { Hono } from "hono";

const app = new Hono();

app.get("/api/health", (c) => c.json({ status: "ok", name: "Quizda API" }));

app.get("/api/quizzes", (c) => {
  const categories = [
    "General Knowledge",
    "Science",
    "Mathematics & Logic",
    "Technology & Computing",
    "History",
    "Geography",
    "Culture & Society",
    "Literature & Language",
    "Arts & Entertainment",
    "Sports & Games",
    "Business & Economics",
    "Politics & Governance",
    "Philosophy & Psychology",
    "Health & Medicine",
    "Nature & Environment",
    "Food & Culinary",
    "Religion & Mythology",
    "Pop Culture",
    "Education & Careers",
    "Automotive & Transportation",
    "Home & Lifestyle",
    "Mythos & Fictional Universes",
    "Ethics & Law",
    "Personal Development",
    "Special Topics / Custom",
  ];

  let idCounter = 1;
  const quizzes = categories.flatMap((cat) => {
    const count = Math.random() > 0.6 ? 2 : 1;
    return Array.from({ length: count }).map((_, idx) => {
      const title = `${cat} Quiz ${idx + 1}`;
      const totalTimeMinutes = [5, 10, 15, 20, 30][
        Math.floor(Math.random() * 5)
      ];
      const tags = [cat.split(" ")[0].toLowerCase(), "sample"];
      const subcategory = idx === 0 ? `${cat} Basics` : `${cat} Advanced`;
      const questions = Array.from({
        length: 6 + Math.floor(Math.random() * 6),
      }).map((__, qIdx) => ({
        id: `q_${idCounter}_${qIdx}`,
        text: `Sample question ${qIdx + 1} for ${title}`,
        choices: ["A", "B", "C", "D"],
        answerIndex: Math.floor(Math.random() * 4),
      }));
      return {
        id: idCounter++,
        title,
        category: cat,
        subcategory,
        tags,
        totalTimeMinutes,
        questionsCount: questions.length,
        questions,
      };
    });
  });

  return c.json(quizzes);
});

// Simple in-memory user store (for demo only)
const users: Array<any> = [];
let nextUserId = 1;

function findUserByUsername(username: string) {
  return users.find((u) => u.username === username);
}

function findUserByEmail(email: string) {
  return users.find((u) => u.email === email);
}

app.post("/api/register", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { username, email, password, role } = body || {};
  if (!username || !email || !password) {
    return c.json(
      { success: false, message: "username, email and password are required" },
      400
    );
  }

  if (findUserByUsername(username)) {
    return c.json({ success: false, message: "username already exists" }, 409);
  }
  if (findUserByEmail(email)) {
    return c.json({ success: false, message: "email already registered" }, 409);
  }

  const newUser = {
    id: nextUserId++,
    username,
    email,
    password, // NOTE: plain passwords are insecure; demo only
    role: role || "attempter",
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);

  const safeUser = {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
  };
  return c.json({ success: true, message: "registered", user: safeUser }, 201);
});

app.post("/api/login", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { username, password } = body || {};
  if (!username || !password) {
    return c.json(
      { success: false, message: "username and password required" },
      400
    );
  }
  const user = findUserByUsername(username);
  if (!user || user.password !== password) {
    return c.json({ success: false, message: "invalid credentials" }, 401);
  }

  const token = `mock-token-${user.id}`;
  return c.json({
    success: true,
    message: "ok",
    token,
    user: { id: user.id, username: user.username, role: user.role },
  });
});

app.post("/api/forgot-password", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email } = body || {};
  if (!email) return c.json({ success: false, message: "email required" }, 400);
  return c.json({
    success: true,
    message: "If the email exists, a reset link was sent (mock).",
  });
});

// Optional migration trigger (dev-only). Attempt to require a migrate module if available.
app.post("/api/migrate", async (c) => {
  try {
    // Attempt to load a migrate module from the server folder if it exists.
    // Use dynamic require guarded by typeof require to avoid bundler/runtime issues in Workers.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const req: any =
      typeof require !== "undefined" ? (require as any) : undefined;
    if (!req)
      return c.json(
        { success: false, message: "migrator not available in this runtime" },
        501
      );
    try {
      const migrator = req("../../server/migrate");
      // If migrator exposes a function, call it (best-effort)
      if (typeof migrator === "function") {
        migrator().catch?.(() => {});
      }
      return c.json({
        success: true,
        message: "Migration started (check server logs)",
      });
    } catch (err) {
      return c.json({ success: false, message: String(err) }, 500);
    }
  } catch (err) {
    return c.json({ success: false, message: String(err) }, 500);
  }
});

// Export Worker fetch handler
export default {
  async fetch(req: Request) {
    return app.fetch(req);
  },
};

// Node dev fallback when run directly (guarded)
// This branch uses dynamic require to avoid bundling Node libs into Workers
// and only runs when executed with Node (require.main === module).
declare const module: any;
if (
  typeof module !== "undefined" &&
  typeof require !== "undefined" &&
  require.main === module
) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any
  const req: any = eval('typeof require !== "undefined" ? require : undefined');
  const express = req ? req("express") : null;
  const cors = req ? req("cors") : null;

  if (express) {
    const port = process.env.PORT || 5173;
    const server = express();
    if (cors) server.use(cors());
    server.use(express.json());

    // Mirror routes for local development
    server.get("/api/health", (_req: any, res: any) =>
      res.json({ status: "ok", name: "Quizda API" })
    );
    server.get("/api/quizzes", (_req: any, res: any) => {
      const categories = [
        "General Knowledge",
        "Science",
        "Mathematics & Logic",
        "Technology & Computing",
        "History",
        "Geography",
      ];
      let idCounter = 1;
      const quizzes = categories.flatMap((cat) => {
        const count = Math.random() > 0.6 ? 2 : 1;
        return Array.from({ length: count }).map((_, idx) => {
          const title = `${cat} Quiz ${idx + 1}`;
          const totalTimeMinutes = [5, 10, 15, 20, 30][
            Math.floor(Math.random() * 5)
          ];
          const tags = [cat.split(" ")[0].toLowerCase(), "sample"];
          const subcategory = idx === 0 ? `${cat} Basics` : `${cat} Advanced`;
          const questions = Array.from({
            length: 6 + Math.floor(Math.random() * 6),
          }).map((__, qIdx) => ({
            id: `q_${idCounter}_${qIdx}`,
            text: `Sample question ${qIdx + 1} for ${title}`,
            choices: ["A", "B", "C", "D"],
            answerIndex: Math.floor(Math.random() * 4),
          }));
          return {
            id: idCounter++,
            title,
            category: cat,
            subcategory,
            tags,
            totalTimeMinutes,
            questionsCount: questions.length,
            questions,
          };
        });
      });
      res.json(quizzes);
    });

    server.post("/api/register", (req: any, res: any) => {
      const { username, email, password, role } = req.body || {};
      if (!username || !email || !password) {
        return res
          .status(400)
          .json({
            success: false,
            message: "username, email and password are required",
          });
      }
      if (users.find((u) => u.username === username))
        return res
          .status(409)
          .json({ success: false, message: "username already exists" });
      if (users.find((u) => u.email === email))
        return res
          .status(409)
          .json({ success: false, message: "email already registered" });
      const newUser = {
        id: nextUserId++,
        username,
        email,
        password,
        role: role || "attempter",
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      const safeUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      };
      return res
        .status(201)
        .json({ success: true, message: "registered", user: safeUser });
    });

    server.post("/api/login", (req: any, res: any) => {
      const { username, password } = req.body || {};
      if (!username || !password)
        return res
          .status(400)
          .json({ success: false, message: "username and password required" });
      const user = users.find((u) => u.username === username);
      if (!user || user.password !== password)
        return res
          .status(401)
          .json({ success: false, message: "invalid credentials" });
      const token = `mock-token-${user.id}`;
      return res.json({
        success: true,
        message: "ok",
        token,
        user: { id: user.id, username: user.username, role: user.role },
      });
    });

    server.post("/api/forgot-password", (req: any, res: any) => {
      const { email } = req.body || {};
      if (!email)
        return res
          .status(400)
          .json({ success: false, message: "email required" });
      return res.json({
        success: true,
        message: "If the email exists, a reset link was sent (mock).",
      });
    });

    server.listen(port, () =>
      console.log(`Quizda Hono dev server listening on ${port}`)
    );
  }
}
