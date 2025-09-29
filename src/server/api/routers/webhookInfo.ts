import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const webhookInfoRouter = createTRPCRouter({
  setWebhookURL: protectedProcedure
    .input(z.string().url())
    .mutation(async ({ ctx, input }) => {
      const userID = ctx.session.user.id;

      const record = await ctx.db.webhookInfo.upsert({
        where: { userID }, // userID is unique
        update: { hostURL: input }, // update if exists
        create: { userID, hostURL: input }, // create if missing
        include: { webhookEvents: true },
      });

      return record;
    }),

  findWebhookInto: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.webhookInfo.findUnique({
      where: {
        userID: ctx.session.user.id,
      },
    });
  }),
});
