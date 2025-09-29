import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { EventType } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const webhookEventRouter = createTRPCRouter({
  setEvent: protectedProcedure
    .input(
      z.object({
        event: z.nativeEnum(EventType),
        enabled: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // require a configured webhook host for this user
      const info = await ctx.db.webhookInfo.findUnique({
        where: { userID: userId },
        select: { ID: true },
      });
      if (!info)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Webhook host not configured",
        });

      const row = await ctx.db.webhookEvent.upsert({
        where: {
          webhookInfoID_event: { webhookInfoID: info.ID, event: input.event },
        },
        update: { enabled: input.enabled },
        create: {
          webhookInfoID: info.ID,
          event: input.event,
          enabled: input.enabled,
        },
      });

      return row;
    }),

  getEvents: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const info = await ctx.db.webhookInfo.findUnique({
      where: { userID: userId },
      include: { webhookEvents: true },
    });
    if (!info) return [];
    return info.webhookEvents;
  }),
});
