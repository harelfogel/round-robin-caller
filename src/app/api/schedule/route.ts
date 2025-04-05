import { NextResponse } from "next/server";

// Contact interface
interface Contact {
  name: string;
  phone: string;
}

// MatchPair and Schedule types
interface MatchPair {
  caller: Contact;
  callee: Contact;
}

type Schedule = MatchPair[][];

// In-memory schedule (server-only, non-persistent)
let inMemorySchedule: Schedule = [];

// Basic round-robin generation
function generateRoundRobin(contacts: Contact[], weeks: number): Schedule {
  const validContacts = contacts.filter(
    (c) => c.name.trim() !== "" && c.phone.trim() !== ""
  );

  if (validContacts.length < 2) return [];

  let arr = [...validContacts];
  const schedule: Schedule = [];

  if (arr.length % 2 !== 0) {
    arr.push({ name: "BYE", phone: "N/A" });
  }

  const rounds = Math.min(weeks, arr.length - 1);

  for (let w = 0; w < rounds; w++) {
    const roundPairs: MatchPair[] = [];

    for (let i = 0; i < arr.length / 2; i++) {
      const caller = arr[i];
      const callee = arr[arr.length - 1 - i];

      if (caller.name !== "BYE" && callee.name !== "BYE") {
        roundPairs.push({ caller, callee });
      }
    }

    schedule.push(roundPairs);

    const fixed = arr[0];
    const toRotate = arr.slice(1);
    toRotate.unshift(toRotate.pop()!);
    arr = [fixed, ...toRotate];
  }

  return schedule;
}

// POST: Generate and store schedule in memory
export async function POST(request: Request) {
  try {
    const { contacts, weeks }: { contacts: Contact[]; weeks: number } =
      await request.json();

    if (!contacts || !weeks) {
      throw new Error("Missing contacts or weeks in request body");
    }

    const schedule = generateRoundRobin(contacts, weeks);
    inMemorySchedule = schedule;

    return NextResponse.json({ success: true, schedule });
  } catch (err) {
    console.error("Error generating schedule:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error occurred.",
      },
      { status: 500 }
    );
  }
}

// DELETE: Clear in-memory schedule
export async function DELETE() {
  try {
    inMemorySchedule = [];
    return NextResponse.json({ success: true, message: "Plan deleted." });
  } catch (err) {
    console.error("Error deleting schedule:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error occurred.",
      },
      { status: 500 }
    );
  }
}
