import express from "express";
import session from "express-session";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./lib/env.js";
import authRouter from "./routes/auth.js";
import eventsRouter from "./routes/events.js";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/api/events", eventsRouter);

const port = env.PORT;
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
