/**
 * A Webhook System Like a Magic Doorbell System
 *
 * Imagine you have a magic doorbell system for your house:
 * - When something happens in your house (someone enters, leaves, etc.)
 * - The doorbell can automatically call your friend's house to tell them!
 * - You can choose which events make the doorbell ring
 * - You can choose which friend's house to call
 *
 * That's exactly what webhooks do for websites!
 *
 * In our app:
 * Your house = This notes app
 * Magic doorbell = Webhook system
 * Events in house = Creating, editing, reading, deleting notes
 * Friend's house = The webhook URL you set
 * Choosing when to ring = The checkboxes for events
 *
 * This component is like the control panel for your magic doorbell system!
 */

"use client";

import { api } from "@/trpc/react";
import type { Note } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function HomeComponent() {
  /**
   * STATE MANAGEMENT - Like Having Different Notebooks
   *
   * Imagine you have different notebooks on your desk to remember things:
   * - One notebook for what you're writing right now
   * - One notebook with all your finished notes
   * - One notebook for the friend's phone number (webhook URL)
   * - One notebook for which events should ring the doorbell
   */

  // For writing new notes (like a draft pad)
  const [note, setNote] = useState<string>(""); // What you're typing right now
  const [notes, setNotes] = useState<Note[]>([]); // Your collection of finished notes

  // For the magic doorbell system (webhook setup)
  const [url, setUrl] = useState<string>(""); // Friend's phone number you're typing
  const [chosenUrl, setChosenUrl] = useState<string>(""); // Friend's saved phone number

  // For choosing when the doorbell rings (which events trigger webhooks)
  const [onNoteCreate, setOnNoteCreate] = useState<boolean>(false); // Ring when you write a note?
  const [onNoteUpdate, setOnNoteUpdate] = useState<boolean>(false); // Ring when you edit a note?
  const [onNoteRead, setOnNoteRead] = useState<boolean>(false); // Ring when you read notes?
  const [onNoteDelete, setOnNoteDelete] = useState<boolean>(false); // Ring when you delete a note?

  // Authentication check - like checking if you have the key to your house
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated" && !!session;

  /**
   * TRPC UTILITIES - Like Having a Smart Assistant
   *
   * Think of 'utils' as your smart assistant who can:
   * - Go check if there's new mail (refresh data from server)
   * - Tell you when something has changed
   * - Help you keep everything up to date
   */
  const utils = api.useUtils();

  /**
   * MUTATIONS - Actions That Change Things on the Server
   *
   * Think of these like sending letters to different places:
   * - One letter goes to the "note storage building" to save a new note
   * - Another letter goes to the "doorbell settings office" to change settings
   */

  // Creating a new note - like writing a letter and sending it to storage
  const createNote = api.note.addNote.useMutation({
    onSuccess: async (newNote) => {
      /**
       * SMART EFFICIENCY - Like Adding to Your Collection Immediately
       *
       * Instead of asking "Hey, can you tell me all my notes again?"
       * We just add the new note to our collection right away!
       * It's like immediately putting a new baseball card in your album
       * instead of going through the whole collection again.
       */
      setNotes((currentNotes) => [newNote, ...currentNotes]);
      setNote(""); // Clear your writing pad

      /**
       * WHY WE DON'T ASK FOR ALL NOTES AGAIN:
       * - We already have the new note from when we saved it
       * - No need to bother the server for information we already have
       * - The page updates instantly instead of waiting
       */
    },
    onError: () => {
      console.error(
        "Could not create the note - like your letter got lost in the mail",
      );
    },
  });

  // Setting up webhook URL - like programming your doorbell with a friend's phone number
  const setupWebhookURL = api.webhookInfo.setWebhookURL.useMutation({
    onSuccess: async (webhookInfo) => {
      /**
       * WHY WE ASK FOR FRESH DOORBELL SETTINGS:
       *
       * When you change your doorbell settings, other people in your house
       * might have also changed things. So we ask: "Hey, what are ALL the
       * current doorbell settings?" to make sure we have the latest info.
       *
       * It's like checking the family bulletin board after making changes.
       */
      await utils.webhookInfo.invalidate();
      setChosenUrl(webhookInfo.hostURL);
      setUrl(""); // Clear your typing area
    },
    onError: () => {
      console.error(
        "Could not set up the webhook - like the doorbell installation failed",
      );
    },
  });

  // Toggling webhook events - like choosing when your doorbell should ring
  const setEvent = api.webhookEvent.setEvent.useMutation({
    onSuccess: () => {
      /**
       * WHY WE CHECK THE DOORBELL SETTINGS AGAIN:
       *
       * When you change when the doorbell rings, it affects the whole system.
       * We want to make sure everyone in the house has the same understanding
       * of when the doorbell will ring. So we refresh those settings.
       */
      void utils.webhookEvent.getEvents.invalidate();
    },
  });

  /**
   * QUERIES - Asking the Server for Information
   *
   * Think of these like asking questions:
   * - "Can you show me all my notes?"
   * - "What's my current doorbell phone number?"
   * - "Which events make my doorbell ring?"
   *
   * These only ask questions if you're logged in (have the house key).
   */
  const { data: posts } = api.note.findAllNotes.useQuery(undefined, {
    enabled: isAuthed,
  });

  const { data: webhook } = api.webhookInfo.findWebhookInto.useQuery(
    undefined,
    {
      enabled: isAuthed,
    },
  );

  const { data: events } = api.webhookEvent.getEvents.useQuery(undefined, {
    enabled: isAuthed,
  });

  /**
   * EFFECTS - Automatic Reactions to Changes
   *
   * Think of these like having a helpful robot that notices changes and updates things:
   * - When new notes arrive from the server, update your notebook
   * - When doorbell info arrives, update your phone number notebook
   * - When event settings arrive, update your checkbox settings
   */

  // When the server gives us notes, put them in our notebook
  useEffect(() => {
    if (posts) setNotes(posts);
  }, [posts]);

  // When the server tells us the doorbell phone number, write it down
  useEffect(() => {
    if (webhook?.hostURL) setChosenUrl(webhook.hostURL);
  }, [webhook?.hostURL]);

  // When the server tells us doorbell settings, update our checkboxes
  useEffect(() => {
    if (!events) return;

    // Look through all the event settings and set our checkboxes accordingly
    setOnNoteCreate(!!events.find((e) => e.event === "NOTE_CREATE")?.enabled);
    setOnNoteRead(!!events.find((e) => e.event === "NOTE_READ")?.enabled);
    setOnNoteUpdate(!!events.find((e) => e.event === "NOTE_UPDATE")?.enabled);
    setOnNoteDelete(!!events.find((e) => e.event === "NOTE_DELETE")?.enabled);
  }, [events]);

  /**
   * LOADING AND ERROR STATES - Like Waiting Rooms
   */
  if (status === "loading")
    return <div>Loading... (like waiting for your house key to work)</div>;
  if (status !== "authenticated")
    return <div>You must login (you need the house key first!)</div>;
  if (!session) return <div>Loading... (still checking your house key)</div>;

  /**
   * HELPER FUNCTIONS - Like Having Shortcuts
   */

  // When someone types in the note area, remember what they're typing
  const handleSetNote = (noteText: string) => {
    setNote(noteText);
  };

  /**
   * THE ACTUAL WEBPAGE LAYOUT
   *
   * Think of this like arranging furniture in different rooms:
   * - Top floor: Note writing room and doorbell control room
   * - Bottom floor: Doorbell phone number setup and information room
   */
  return (
    <main className="h-screen w-full p-4">
      <div className="flex h-full w-full flex-col">
        {/* TOP FLOOR: Notes and Events */}
        <div className="flex h-full w-full flex-row">
          {/* LEFT ROOM: Create and manage notes */}
          <div className="flex h-full w-full flex-col items-center">
            <h1 className="text-2xl">
              <strong>Create a Note</strong>
            </h1>
            <p className="mb-4 text-sm text-gray-600">
              Notes you create here can trigger webhook notifications (ring the
              doorbell)!
            </p>

            <div className="w-full">
              <form
                className="flex flex-col gap-1"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <label>Write your note</label>
                <textarea
                  className="rounded-sm border p-2 outline"
                  value={note}
                  onChange={(e) => handleSetNote(e.target.value)}
                  placeholder="What's on your mind?"
                />
                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-lg bg-black p-4 text-white transition-colors hover:bg-gray-800"
                  onClick={(e) => {
                    e.preventDefault();
                    if (note.trim()) {
                      createNote.mutate(note.trim());
                    }
                  }}
                  disabled={createNote.isPending || !note.trim()}
                >
                  {createNote.isPending ? "Saving..." : "Save Note"}
                </button>
              </form>

              {/* Your Collection of Notes */}
              <div className="m-1 mt-4 flex h-full flex-col gap-2 overflow-y-auto">
                <h3 className="font-semibold">Your Notes:</h3>
                {notes.length === 0 ? (
                  <p className="text-gray-500 italic">
                    No notes yet. Create one above! (Your collection is empty)
                  </p>
                ) : (
                  notes.map((note) => (
                    <NoteItem
                      key={note.ID}
                      note={note}
                      onUpdate={(updatedNote) => {
                        // Update your collection immediately (like replacing a card in your album)
                        setNotes((currentNotes) =>
                          currentNotes.map((n) =>
                            n.ID === updatedNote.ID ? updatedNote : n,
                          ),
                        );
                      }}
                      onDelete={(deletedId) => {
                        // Remove from your collection immediately (like taking a card out of your album)
                        setNotes((currentNotes) =>
                          currentNotes.filter((n) => n.ID !== deletedId),
                        );
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT ROOM: Doorbell control panel */}
          <div className="flex h-full w-full flex-col items-center">
            <h1 className="text-2xl">
              <strong>Webhook Events</strong>
            </h1>
            <p className="mb-4 text-sm text-gray-600">
              Choose which note actions should ring your magic doorbell
            </p>

            <div className="flex flex-col gap-4">
              {CreateCheckbox("Create", onNoteCreate, (next) => {
                setOnNoteCreate(next); // Update the switch immediately (instant feedback)
                setEvent.mutate({ event: "NOTE_CREATE", enabled: next });
              })}
              {CreateCheckbox("Read", onNoteRead, (next) => {
                setOnNoteRead(next); // Update the switch immediately
                setEvent.mutate({ event: "NOTE_READ", enabled: next });
              })}
              {CreateCheckbox("Update", onNoteUpdate, (next) => {
                setOnNoteUpdate(next); // Update the switch immediately
                setEvent.mutate({ event: "NOTE_UPDATE", enabled: next });
              })}
              {CreateCheckbox("Delete", onNoteDelete, (next) => {
                setOnNoteDelete(next); // Update the switch immediately
                setEvent.mutate({ event: "NOTE_DELETE", enabled: next });
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM FLOOR: Doorbell setup and information */}
        <div className="flex h-full w-full flex-row gap-4">
          {/* LEFT ROOM: Doorbell phone number setup */}
          <div className="flex w-full flex-col">
            <h2 className="mb-2 text-xl font-semibold">
              Webhook Configuration
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Set the phone number where your magic doorbell should call
              (webhook URL)
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="flex flex-col gap-2"
            >
              <label>Webhook URL</label>
              <input
                className="rounded-sm border p-2 outline"
                type="url"
                placeholder="https://example.com/webhook"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />

              {chosenUrl && (
                <div className="rounded border border-green-200 bg-green-50 p-2">
                  <p className="text-sm text-green-700">
                    <strong>Current webhook URL (saved phone number):</strong>{" "}
                    {chosenUrl}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full cursor-pointer rounded-lg bg-black p-4 text-white transition-colors hover:bg-gray-800"
                onClick={(e) => {
                  e.preventDefault();
                  if (url.trim()) {
                    setupWebhookURL.mutate(url.trim());
                  }
                }}
                disabled={setupWebhookURL.isPending || !url.trim()}
              >
                {setupWebhookURL.isPending ? "Setting..." : "Set Webhook URL"}
              </button>
            </form>
          </div>

          {/* RIGHT ROOM: Information and help center */}
          <div className="w-full rounded border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-800">
              How This Magic Doorbell Works
            </h3>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>
                • When you do things with notes, notifications can be sent
                automatically
              </li>
              <li>
                • Use the checkboxes to choose which actions trigger the
                doorbell
              </li>
              <li>• Set a webhook URL so the doorbell knows where to call</li>
              {/* &apos; -> ' This is to prevent injection attacks */}
              <li>
                • Your webhook endpoint (friend&apos;s house) will receive POST
                requests with information about what happened
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * HELPER COMPONENT: Light Switch for Webhook Events
 *
 * Think of this like a light switch with a label:
 * - The label says what the switch controls ("Ring when note is created")
 * - The switch can be ON or OFF
 * - When you flip it, something happens
 */
const CreateCheckbox = (
  title: string,
  value: boolean,
  onToggle: (next: boolean) => void,
) => (
  <div className="flex w-full items-center justify-between gap-2 rounded border p-2 hover:bg-gray-50">
    <label className="cursor-pointer">On note {title}</label>
    <input
      type="checkbox"
      checked={value}
      onChange={() => onToggle(!value)}
      className="cursor-pointer"
    />
  </div>
);

/**
 * COMPONENT: Individual Note Card (Like a Trading Card)
 *
 * Think of each note like a trading card:
 * - You can look at it (read mode)
 * - You can edit what's written on it (edit mode)
 * - You can throw it away (delete)
 * - Each card has buttons to do these things
 */
const NoteItem = ({
  note,
  onUpdate,
  onDelete,
}: {
  note: Note;
  onUpdate: (note: Note) => void;
  onDelete: (id: string) => void;
}) => {
  const utils = api.useUtils();

  // Updating a note - like erasing and rewriting on your trading card
  const update = api.note.updateNote.useMutation({
    onSuccess: (success) => {
      /**
       * SMART UPDATE STRATEGY:
       *
       * When we successfully update a note, the server just tells us "success!"
       * instead of sending back the whole updated note.
       *
       * So we're smart about it:
       * 1. We create the updated note ourselves (we know what we changed)
       * 2. We update our local collection immediately (instant feedback)
       * 3. We also ask the server for fresh data (in case other people made changes)
       *
       * It's like updating your own trading card album right away, but also
       * checking with friends to see if they have any updates to share.
       */
      if (success) {
        const updatedNote = { ...note, data: text.trim() };
        onUpdate(updatedNote);
        void utils.note.findAllNotes.invalidate(); // Check for other people's changes
        setEditing(false);
      }
    },
  });

  // Deleting a note - like throwing away a trading card
  const del = api.note.deleteNote.useMutation({
    onSuccess: () => {
      /**
       * SMART DELETE STRATEGY:
       *
       * When we delete a note:
       * 1. We remove it from our collection immediately (instant feedback)
       * 2. We also ask the server for fresh data (in case other people made changes)
       *
       * It's like throwing away a card from your album right away, but also
       * checking with friends to see what's new in their collections.
       */
      onDelete(note.ID);
      void utils.note.findAllNotes.invalidate(); // Check for other people's changes
    },
  });

  // State for editing - like flipping a card over to write on the back
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.data);

  return (
    <div className="flex items-start gap-2 rounded border bg-white p-3 shadow-sm">
      {editing ? (
        /* EDIT MODE - Like writing on the back of your trading card */
        <textarea
          className="min-h-[60px] flex-1 rounded border p-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
      ) : (
        /* READ MODE - Like looking at the front of your trading card */
        <p className="flex-1 whitespace-pre-wrap">{note.data}</p>
      )}

      {editing ? (
        /* EDITING BUTTONS - Save your changes or cancel */
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-700 hover:bg-green-100 disabled:opacity-50"
            disabled={update.isPending || text.trim().length < 2}
            onClick={() => update.mutate({ ID: note.ID, data: text.trim() })}
          >
            {update.isPending ? "..." : "Save"}
          </button>
          <button
            type="button"
            className="rounded border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              setText(note.data); // Put back the original text
              setEditing(false); // Stop editing
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        /* NORMAL BUTTONS - Edit or delete your trading card */
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
          <button
            type="button"
            className="rounded border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50"
            disabled={del.isPending}
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to delete this note? (Like throwing away your trading card forever)",
                )
              ) {
                del.mutate(note.ID);
              }
            }}
          >
            {del.isPending ? "..." : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * SUMMARY OF WHAT WE LEARNED - Like a Study Guide
 *
 * EFFICIENCY LESSONS (Making Things Fast):
 * 1. Create Note: Update your collection immediately instead of asking server for everything again
 * 2. Edit Note: Update locally first, then check with server for consistency
 * 3. Delete Note: Remove locally first, then check with server for consistency
 * 4. Event Toggles: Update switches immediately, then save to server
 *
 * LOGICAL LESSONS (When to Ask the Server for Fresh Data):
 * 1. Note Creation: NO need to ask again (we already have the new note)
 * 2. Webhook URL: YES ask again (need latest configuration settings)
 * 3. Event Settings: YES ask again (affects the whole doorbell system)
 * 4. Note Edit/Delete: YES ask again (other people might have made changes too)
 *
 * USER EXPERIENCE LESSONS (Making Users Happy):
 * 1. Instant feedback - things happen immediately when you click
 * 2. Loading states - users know when something is working
 * 3. Confirmation dialogs - prevent accidents ("Are you sure?")
 * 4. Clear explanations - users understand what everything does
 * 5. Good organization - everything has its place
 *
 * WEBHOOK LESSONS (The Magic Doorbell):
 * - Webhooks are like automatic phone calls to tell someone something happened
 * - You choose which events trigger the calls (checkboxes)
 * - You choose who to call (webhook URL)
 * - The system handles all the technical stuff automatically
 * - It's useful for connecting different systems together
 */
