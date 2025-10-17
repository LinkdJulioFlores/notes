"use client";

import { api } from "@/trpc/react";
import type { Note } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
export default function HomeComponent() {
  const [note, setNote] = useState<string>("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [url, setUrl] = useState<string>("");
  const [chosenUrl, setChosenUrl] = useState<string>("");
  const [onNoteCreate, setOnNoteCreate] = useState<boolean>(false);
  const [onNoteUpdate, setOnNoteUpdate] = useState<boolean>(false);
  const [onNoteRead, setOnNoteRead] = useState<boolean>(false);
  const [onNoteDelete, setOnNoteDelete] = useState<boolean>(false);
  const { data: session, status } = useSession();
  const utils = api.useUtils();
  const createNote = api.note.addNote.useMutation({
    onSuccess: async (note) => {
      await utils.note.invalidate();
      setNotes((arr) => [note, ...arr]);
      setNote("");
    },
    onError: () => {
      console.error("Could not create the note");
    },
  });
  const setupWebhookURL = api.webhookInfo.setWebhookURL.useMutation({
    onSuccess: async (webhookInfo) => {
      await utils.webhookInfo.invalidate();
      setChosenUrl(webhookInfo.hostURL);
      setUrl("");
    },
    onError: () => {
      console.error("Could not create the web hook");
    },
  });
  // one mutation for all toggles
  const setEvent = api.webhookEvent.setEvent.useMutation({
    onSuccess: () => utils.webhookEvent.getEvents.invalidate(),
  });

  const isAuthed = status === "authenticated" && !!session;

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

  useEffect(() => {
    if (posts) setNotes(posts);
  }, [posts]);

  useEffect(() => {
    if (webhook?.hostURL) setChosenUrl(webhook.hostURL);
  }, [webhook?.hostURL]);

  useEffect(() => {
    if (!events) return;
    setOnNoteCreate(!!events.find((e) => e.event === "NOTE_CREATE")?.enabled);
    setOnNoteRead(!!events.find((e) => e.event === "NOTE_READ")?.enabled);
    setOnNoteUpdate(!!events.find((e) => e.event === "NOTE_UPDATE")?.enabled);
    setOnNoteDelete(!!events.find((e) => e.event === "NOTE_DELETE")?.enabled);
  }, [events]);

  if (status === "loading") return <div>Loading...</div>;
  if (status !== "authenticated") return <div>You must login</div>;
  if (!session) return <div>Loading...</div>;

  /**
   * Caches the note value
   */
  const handleSetNote = (note: string) => {
    setNote(note);
  };

  return (
    <main className="h-screen w-full p-4">
      <div className="flex h-full w-full flex-col">
        {/* Q2 */}
        <div className="flex h-full w-full flex-row">
          <div className="flex h-full w-full flex-col items-center">
            <h1 className="text-2xl">
              <strong>Create a note</strong>
            </h1>
            <div className="w-full">
              <form
                className="flex flex-col gap-1"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <label>Write your note</label>
                <textarea
                  className="rounded-sm outline"
                  value={note}
                  onChange={(e) => handleSetNote(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-lg bg-black p-4 text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    createNote.mutate(note);
                  }}
                >
                  Save note
                </button>
              </form>
              <div className="m-1 flex h-full flex-col gap-2 overflow-y-auto">
                {notes.map((note, idx) => (
                  <NoteItem key={idx} note={note} />
                ))}
              </div>
            </div>
          </div>

          {/* Q1 Controls what events the user wants to listen for */}
          <div className="flex h-full w-full flex-col items-center">
            <h1 className="text-2xl">
              <strong>events</strong>
            </h1>
            <div className="flex flex-col gap-4">
              {CreateCheckbox("Create", onNoteCreate, (next) => {
                setOnNoteCreate(next);
                setEvent.mutate({ event: "NOTE_CREATE", enabled: next });
              })}
              {CreateCheckbox("Read", onNoteRead, (next) => {
                setOnNoteRead(next);
                setEvent.mutate({ event: "NOTE_READ", enabled: next });
              })}
              {CreateCheckbox("Update", onNoteUpdate, (next) => {
                setOnNoteUpdate(next);
                setEvent.mutate({ event: "NOTE_UPDATE", enabled: next });
              })}
              {CreateCheckbox("Delete", onNoteDelete, (next) => {
                setOnNoteDelete(next);
                setEvent.mutate({ event: "NOTE_DELETE", enabled: next });
              })}
            </div>
          </div>
        </div>
        <div className="flex h-full w-full flex-row gap-4">
          {/* Q3 */}
          <div className="flex w-full flex-col">
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="flex flex-col gap-2"
            >
              <label>Set the webhook url</label>
              <input
                className="rounded-sm outline"
                type="text"
                placeholder="example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              {chosenUrl}
              <button
                type="submit"
                className="w-full cursor-pointer rounded-lg bg-black p-4 text-white"
                onClick={(e) => {
                  e.preventDefault();
                  setupWebhookURL.mutate(url);
                }}
              >
                Set Webhook URL
              </button>
            </form>
          </div>
          {/* Q4 */}
          <div className="w-full">Empty</div>
        </div>
      </div>
    </main>
  );
}

const CreateCheckbox = (
  title: string,
  value: boolean,
  onToggle: (next: boolean) => void,
) => (
  <div className="flex w-full justify-between gap-2">
    <label>On note {title}</label>
    <input type="checkbox" checked={value} onChange={() => onToggle(!value)} />
  </div>
);

/** Note item with edit/delete */
const NoteItem = ({ note }: { note: Note }) => {
  const utils = api.useUtils();
  const update = api.note.updateNote.useMutation({
    onSuccess: () => utils.note.findAllNotes.invalidate(),
  });
  const del = api.note.deleteNote.useMutation({
    onSuccess: () => utils.note.findAllNotes.invalidate(),
  });

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.data);

  return (
    <div className="flex items-start gap-2 rounded border p-2">
      {editing ? (
        <textarea
          className="flex-1 rounded border p-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      ) : (
        <p className="flex-1 whitespace-pre-wrap">{note.data}</p>
      )}

      {editing ? (
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded border px-2 py-1"
            disabled={update.isPending || text.trim().length < 2}
            onClick={() => update.mutate({ ID: note.ID, data: text.trim() })}
          >
            Save
          </button>
          <button
            type="button"
            className="rounded border px-2 py-1"
            onClick={() => {
              setText(note.data);
              setEditing(false);
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded border px-2 py-1"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
          <button
            type="button"
            className="rounded border px-2 py-1"
            disabled={del.isPending}
            onClick={() => del.mutate(note.ID)}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};
