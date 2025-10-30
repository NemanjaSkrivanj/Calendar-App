import { Router } from "express";
import dayjs from "dayjs";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  createEventForUser,
  deleteEventForUser,
  syncUserEvents,
} from "../services/eventSync.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const userId = (req as any).userId as string;
  const rangeDays = Number((req.query.rangeDays as string) ?? "7");
  const startStr =
    (req.query.start as string) ?? dayjs().startOf("day").toISOString();
  const start = dayjs(startStr);
  const end = start.add(rangeDays - 1, "day").endOf("day");

  const events = await prisma.event.findMany({
    where: {
      userId,
      start: { gte: start.toDate() },
      end: { lte: end.toDate() },
    },
    orderBy: { start: "asc" },
  });
  res.json({ events });
});

router.post("/", async (req, res) => {
  const userId = (req as any).userId as string;
  const { title, date, startTime, endTime } = req.body as {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  if (!title || !date || !startTime || !endTime)
    return res.status(400).json({ error: "Missing fields" });
  const start = dayjs(`${date}T${startTime}`).toDate();
  const end = dayjs(`${date}T${endTime}`).toDate();
  await createEventForUser(userId, { title, start, end });
  res.json({ ok: true });
});

router.post("/refresh", async (req, res) => {
  const userId = (req as any).userId as string;
  await syncUserEvents(userId);
  res.json({ ok: true });
});

router.delete("/:id", async (req, res) => {
  const userId = (req as any).userId as string;
  const eventId = req.params.id;
  try {
    await deleteEventForUser(userId, eventId);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to delete event" });
  }
});

export default router;
