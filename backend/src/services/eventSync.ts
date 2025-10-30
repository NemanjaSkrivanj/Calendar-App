import dayjs from "dayjs";
import { google } from "googleapis";
import { prisma } from "../lib/prisma.js";
import { getAuthorizedClientForUser } from "./googleClient.js";

export async function syncUserEvents(userId: string) {
  const auth = await getAuthorizedClientForUser(userId);
  const calendar = google.calendar({ version: "v3", auth });

  const timeMin = dayjs().subtract(6, "month").startOf("day").toISOString();
  const timeMax = dayjs().add(6, "month").endOf("day").toISOString();

  const items: any[] = [];
  let pageToken: string | undefined = undefined;
  do {
    const { data } = await calendar.events.list({
      calendarId: "primary",
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      pageToken,
    });
    if (data.items?.length) items.push(...data.items);
    pageToken = data.nextPageToken ?? undefined;
  } while (pageToken);

  const googleEventIds = new Set<string>();

  for (const ev of items) {
    const googleEventId = ev.id as string;
    const start = ev.start?.dateTime ?? ev.start?.date;
    const end = ev.end?.dateTime ?? ev.end?.date;
    if (!googleEventId || !start || !end) continue;

    googleEventIds.add(googleEventId);

    await prisma.event.upsert({
      where: { userId_googleEventId: { userId, googleEventId } },
      update: {
        title: ev.summary ?? "Untitled",
        start: new Date(start),
        end: new Date(end),
      },
      create: {
        userId,
        googleEventId,
        title: ev.summary ?? "Untitled",
        start: new Date(start),
        end: new Date(end),
      },
    });
  }

  await prisma.event.deleteMany({
    where: {
      userId,
      googleEventId: {
        notIn: Array.from(googleEventIds),
      },
      start: {
        gte: dayjs().subtract(6, "month").startOf("day").toDate(),
        lte: dayjs().add(6, "month").endOf("day").toDate(),
      },
    },
  });
}

export async function createEventForUser(
  userId: string,
  params: {
    title: string;
    start: Date;
    end: Date;
  }
) {
  const auth = await getAuthorizedClientForUser(userId);
  const calendar = google.calendar({ version: "v3", auth });
  const { data } = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: params.title,
      start: { dateTime: params.start.toISOString() },
      end: { dateTime: params.end.toISOString() },
    },
  });

  const googleEventId = data.id as string;
  await prisma.event.create({
    data: {
      userId,
      googleEventId,
      title: params.title,
      start: params.start,
      end: params.end,
    },
  });
}

export async function deleteEventForUser(userId: string, eventId: string) {
  // First, find the event in the database to get the googleEventId
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      userId,
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // Delete from Google Calendar
  const auth = await getAuthorizedClientForUser(userId);
  const calendar = google.calendar({ version: "v3", auth });
  await calendar.events.delete({
    calendarId: "primary",
    eventId: event.googleEventId,
  });

  // Delete from database
  await prisma.event.delete({
    where: {
      id: eventId,
    },
  });
}
