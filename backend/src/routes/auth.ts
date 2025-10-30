import { Router } from "express";
import { google } from "googleapis";
import { env } from "../lib/env.js";
import { getOAuth2Client } from "../services/googleClient.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

const scopes = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar",
];

router.get("/google", (req, res) => {
  const oauth2Client = getOAuth2Client();
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
  res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  const code = req.query.code as string | undefined;
  if (!code) return res.status(400).send("Missing code");
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data: me } = await oauth2.userinfo.get();
  const googleId = me.id as string;
  const email = me.email as string;
  const name = me.name ?? "";

  const user = await prisma.user.upsert({
    where: { googleId },
    update: {
      email,
      name,
      accessToken: tokens.access_token ?? null,
      refreshToken: tokens.refresh_token ?? undefined,
      tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    },
    create: {
      googleId,
      email,
      name,
      accessToken: tokens.access_token ?? null,
      refreshToken: tokens.refresh_token ?? null,
      tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    },
  });

  (req.session as any).userId = user.id;
  // Wait for session to save before redirecting
  req.session.save((err) => {
    if (err) {
      console.error("Session save error:", err);
      return res.status(500).send("Failed to save session");
    }
    // Redirect to frontend main page
    const redirect = `${env.CORS_ORIGIN}/`;
    res.redirect(redirect);
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

router.get("/me", (req, res) => {
  const userId = (req.session as any)?.userId as string | undefined;
  if (!userId) return res.status(200).json({ user: null });
  res.json({ user: { id: userId } });
});

export default router;
