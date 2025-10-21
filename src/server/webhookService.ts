import type { EventType } from "@prisma/client";

// Challenge: See if you can document this and fully grasp what's going
// on here?

export class WebhookService {
  static async updateWebhook<T>(url: string, type: EventType, data: T) {
    const urlObj = new URL(url);

    try {
      const response = await fetch(urlObj.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, timestamp: Date.now(), data }),
      });
      if (!response.ok) {
        console.error(
          `Webhook request failed: ${response.status} ${response.statusText}`,
        );
      }
    } catch (err) {
      console.error("Webhook request error:", err);
    }
  }
}
