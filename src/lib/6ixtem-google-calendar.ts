import "server-only";

import crypto from "node:crypto";
import { google, type calendar_v3 } from "googleapis";
import { prisma } from "@/lib/prisma";

export const CONSULTATION_TIME_ZONE = "Africa/Lagos";
export const CONSULTATION_MINUTES = 30;

const WORKDAY_START_MINUTES = 9 * 60;
const WORKDAY_END_MINUTES = 17 * 60;

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`,
    );
  }

  return value;
}

function getOAuthClient() {
  return new google.auth.OAuth2(
    requiredEnv("GOOGLE_CLIENT_ID"),
    requiredEnv("GOOGLE_CLIENT_SECRET"),
    requiredEnv("GOOGLE_REDIRECT_URI"),
  );
}

function encryptionKey(): Buffer {
  const key = requiredEnv(
    "GOOGLE_TOKEN_ENCRYPTION_KEY",
  );

  if (!/^[a-fA-F0-9]{64}$/.test(key)) {
    throw new Error(
      "GOOGLE_TOKEN_ENCRYPTION_KEY must contain 64 hexadecimal characters.",
    );
  }

  return Buffer.from(key, "hex");
}

function encryptToken(token: string): string {
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    encryptionKey(),
    iv,
  );

  const ciphertext = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

function decryptToken(payload: string): string {
  const [ivPart, tagPart, ciphertextPart] =
    payload.split(".");

  if (!ivPart || !tagPart || !ciphertextPart) {
    throw new Error(
      "Stored Google refresh token has an invalid format.",
    );
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivPart, "base64url"),
  );

  decipher.setAuthTag(
    Buffer.from(tagPart, "base64url"),
  );

  return Buffer.concat([
    decipher.update(
      Buffer.from(ciphertextPart, "base64url"),
    ),
    decipher.final(),
  ]).toString("utf8");
}

export function createOAuthState(): string {
  const timestamp = Date.now().toString();

  const nonce = crypto
    .randomBytes(24)
    .toString("base64url");

  const payload = `${timestamp}.${nonce}`;

  const signature = crypto
    .createHmac(
      "sha256",
      requiredEnv("GOOGLE_CALENDAR_CONNECT_SECRET"),
    )
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function verifyOAuthState(
  state: string | null,
): boolean {
  if (!state) return false;

  const parts = state.split(".");

  if (parts.length !== 3) return false;

  const [timestamp, nonce, signature] = parts;

  if (
    !/^\d+$/.test(timestamp) ||
    !nonce ||
    !signature
  ) {
    return false;
  }

  const age = Date.now() - Number(timestamp);

  if (age < 0 || age > 10 * 60 * 1000) {
    return false;
  }

  const expected = crypto
    .createHmac(
      "sha256",
      requiredEnv("GOOGLE_CALENDAR_CONNECT_SECRET"),
    )
    .update(`${timestamp}.${nonce}`)
    .digest();

  const actual = Buffer.from(
    signature,
    "base64url",
  );

  return (
    actual.length === expected.length &&
    crypto.timingSafeEqual(actual, expected)
  );
}

export async function saveGoogleTokens(
  refreshToken: string,
  connectedEmail?: string | null,
) {
  await prisma.googleCalendarConnection.upsert({
    where: {
      id: "primary",
    },

    create: {
      id: "primary",
      encryptedRefreshToken:
        encryptToken(refreshToken),
      calendarId: "primary",
      connectedEmail: connectedEmail ?? null,
    },

    update: {
      encryptedRefreshToken:
        encryptToken(refreshToken),
      calendarId: "primary",
      connectedEmail: connectedEmail ?? null,
    },
  });
}

export async function getCalendarClient(): Promise<{
  calendar: calendar_v3.Calendar;
  calendarId: string;
}> {
  const connection =
    await prisma.googleCalendarConnection.findUnique({
      where: {
        id: "primary",
      },
    });

  if (!connection) {
    throw new Error(
      "Google Calendar is not connected.",
    );
  }

  const oauth = getOAuthClient();

  oauth.setCredentials({
    refresh_token: decryptToken(
      connection.encryptedRefreshToken,
    ),
  });

  return {
    calendar: google.calendar({
      version: "v3",
      auth: oauth,
    }),
    calendarId: connection.calendarId || "primary",
  };
}

function datePartsInZone(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: CONSULTATION_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(date);

  const map = Object.fromEntries(
    parts.map((part) => [
      part.type,
      part.value,
    ]),
  );

  const weekdays: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    weekday: weekdays[map.weekday] ?? 0,
  };
}

/**
 * Convert a Lagos local date and time to a UTC instant.
 * Nigeria uses UTC+1 and does not observe daylight saving time.
 */
function localDateToUtc(
  dateString: string,
  hour: number,
  minute = 0,
): Date {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

  if (!match) {
    throw new Error(
      "Date must use YYYY-MM-DD.",
    );
  }

  const [, year, month, day] = match;

  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      hour - 1,
      minute,
    ),
  );
}

export function localDateRange(dateString: string) {
  return {
    start: localDateToUtc(dateString, 0),
    end: localDateToUtc(
      addLocalDays(dateString, 1),
      0,
    ),
  };
}

export function addLocalDays(
  dateString: string,
  days: number,
): string {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

  if (!match) {
    throw new Error(
      "Date must use YYYY-MM-DD.",
    );
  }

  const date = new Date(
    Date.UTC(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]) + days,
    ),
  );

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function isValidLocalDate(
  dateString: string,
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const date = new Date(
    `${dateString}T00:00:00Z`,
  );

  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === dateString
  );
}

export function isValidConsultationSlot(
  start: Date,
): boolean {
  if (!Number.isFinite(start.getTime())) {
    return false;
  }

  const parts = datePartsInZone(start);

  const minutes =
    parts.hour * 60 + parts.minute;

  return (
    parts.weekday >= 1 &&
    parts.weekday <= 5 &&
    parts.minute === 0 &&
    minutes >= WORKDAY_START_MINUTES &&
    minutes + CONSULTATION_MINUTES <=
      WORKDAY_END_MINUTES &&
    minutes % CONSULTATION_MINUTES === 0 &&
    start.getTime() > Date.now()
  );
}

export function createSlotsForDate(
  dateString: string,
  busy: Array<{
    start: Date;
    end: Date;
  }>,
) {
  const range = localDateRange(dateString);

  // Noon in Lagos reliably identifies the weekday
  // for the requested local calendar date.
  const weekdayParts = datePartsInZone(
    new Date(
      range.start.getTime() +
        12 * 60 * 60 * 1000,
    ),
  );

  if (
    weekdayParts.weekday < 1 ||
    weekdayParts.weekday > 5
  ) {
    return [];
  }

  const slots: Array<{
    startAt: string;
    endAt: string;
    label: string;
  }> = [];

  for (
    let minute = WORKDAY_START_MINUTES;
    minute + CONSULTATION_MINUTES <=
    WORKDAY_END_MINUTES;
    minute += CONSULTATION_MINUTES
  ) {
    const start = localDateToUtc(
      dateString,
      Math.floor(minute / 60),
      minute % 60,
    );

    const end = new Date(
      start.getTime() +
        CONSULTATION_MINUTES * 60_000,
    );

    if (start.getTime() <= Date.now()) {
      continue;
    }

    const overlaps = busy.some(
      (interval) =>
        start.getTime() < interval.end.getTime() &&
        end.getTime() > interval.start.getTime(),
    );

    if (overlaps) continue;

    slots.push({
      startAt: start.toISOString(),
      endAt: end.toISOString(),

      label: new Intl.DateTimeFormat("en-NG", {
        timeZone: CONSULTATION_TIME_ZONE,
        hour: "numeric",
        minute: "2-digit",
      }).format(start),
    });
  }

  return slots;
}

export async function getBusyIntervals(
  start: Date,
  end: Date,
) {
  const { calendar, calendarId } =
    await getCalendarClient();

  const [freeBusy, bookings] = await Promise.all([
    calendar.freebusy.query({
      requestBody: {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        timeZone: CONSULTATION_TIME_ZONE,
        items: [
          {
            id: calendarId,
          },
        ],
      },
    }),

    prisma.booking.findMany({
      where: {
        status: "BOOKED",
        startAt: {
          lt: end,
        },
        endAt: {
          gt: start,
        },
      },

      select: {
        startAt: true,
        endAt: true,
      },
    }),
  ]);

  const googleBusy =
    freeBusy.data.calendars?.[calendarId]?.busy ?? [];

  return [
    ...googleBusy
      .filter(
        (item) => item.start && item.end,
      )
      .map((item) => ({
        start: new Date(item.start!),
        end: new Date(item.end!),
      })),

    ...bookings.map((booking) => ({
      start: booking.startAt,
      end: booking.endAt,
    })),
  ];
}

export function buildOAuthClient() {
  return getOAuthClient();
}

export const CALENDAR_SCOPE =
  "https://www.googleapis.com/auth/calendar";