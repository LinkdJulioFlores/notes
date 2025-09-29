import type { EventType } from "@prisma/client";

export class WebhookService {
  static async updateWebhook<T>(url: string, type: EventType, data: T) {
    const urlObj = new URL(url);

    try {
      const res = await fetch(urlObj.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, timestamp: Date.now(), data }),
      });
      if (!res.ok) {
        console.error(
          `Webhook request failed: ${res.status} ${res.statusText}`,
        );
      }
    } catch (err) {
      console.error("Webhook request error:", err);
    }
  }
}
