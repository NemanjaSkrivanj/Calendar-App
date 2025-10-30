import { google } from "googleapis";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  );
}

export async function getAuthorizedClientForUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: user.accessToken ?? undefined,
    refresh_token: user.refreshToken ?? undefined,
    expiry_date: user.tokenExpiry?.getTime(),
  });
  oauth2Client.on("tokens", async (tokens) => {
    await prisma.user.update({
      where: { id: userId },
      data: {
        accessToken: tokens.access_token ?? user.accessToken,
        refreshToken: tokens.refresh_token ?? user.refreshToken,
        tokenExpiry: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : user.tokenExpiry,
      },
    });
  });
  return oauth2Client;
}
