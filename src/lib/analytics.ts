
type AnalyticsEvent =
  | "assessment_started"
  | "assessment_completed"
  | "consultation_booking_started"
  | "consultation_booked";

type EventParams = Record<string, string | number | boolean>;

export function trackEvent(
  eventName: AnalyticsEvent,
  params?: EventParams,
) {
  if (typeof window === "undefined") return;

  const gtag = (
    window as Window & {
      gtag?: (
        command: "event",
        eventName: string,
        params?: EventParams,
      ) => void;
    }
  ).gtag;

  gtag?.("event", eventName, params);
}
