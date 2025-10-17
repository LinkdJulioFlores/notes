import { WebhookService } from "@/server/webhookService";
import z from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  type TRPCContext,
} from "../trpc";
import type { EventType } from "@prisma/client";

export const noteRouter = createTRPCRouter({
  /** Create */
  addNote: protectedProcedure
    .input(z.string().trim().min(1))
    .mutation(async ({ ctx, input }) => {
      const note = await ctx.db.note.create({
        data: {
          data: input,
          title: "Some title",
          updatedOn: new Date(),
        },
      });
      await updateHost(ctx, "NOTE_CREATE", note);
      return note;
    }),

  /* UPDATE */
  updateNote: protectedProcedure
    .input(
      z.object({
        ID: z.string().trim(),
        data: z.string().trim().min(2),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let success = false;
      const note = await ctx.db.note.update({
        where: {
          ID: input.ID,
        },
        data: {
          data: input.data,
        },
      });
      await updateHost(ctx, "NOTE_UPDATE", note);
      if (note) success = true;
      return success;
    }),

  // READ
  findAllNotes: protectedProcedure.query(async ({ ctx }) => {
    const foundNotes = (await ctx.db.note.findMany()) ?? null;
    await updateHost(ctx, "NOTE_READ", foundNotes);
    return foundNotes;
  }),

  // DELETE
  deleteNote: protectedProcedure
    .input(z.string().trim().min(1))
    .mutation(async ({ ctx, input }) => {
      let success = false;
      const note = await ctx.db.note.delete({
        where: {
          ID: input,
        },
      });
      if (note) success = true;

      await updateHost(ctx, "NOTE_DELETE", note);
      return success;
    }),
});

async function updateHost<T>(ctx: TRPCContext, type: EventType, data: T) {
  if (!ctx.session) return;
  const webhookInfo = await ctx.db.webhookInfo.findFirst({
    where: {
      userID: ctx.session.user.id,
    },
    include: {
      webhookEvents: true,
    },
  });

  if (!webhookInfo) return;

  for (const eventInfo of webhookInfo.webhookEvents) {
    if (eventInfo.event === type && eventInfo.enabled) {
      await WebhookService.updateWebhook(webhookInfo.hostURL, type, data);
      return;
    }
  }
}
