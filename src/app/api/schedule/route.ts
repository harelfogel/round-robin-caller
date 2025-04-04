// app/api/schedule/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

interface Contact {
  name: string;
  phone: string;
}

// Basic round-robin for demonstration
function generateRoundRobin(contacts: Contact[], weeks: number) {
  const validContacts = contacts.filter(
    (c) => c.name.trim() !== "" && c.phone.trim() !== ""
  );

  if (validContacts.length < 2) return [];

  let arr = [...validContacts];
  const schedule = [];
  const total = arr.length;

  // If odd, add dummy
  const isOdd = total % 2 !== 0;
  if (isOdd) {
    arr.push({ name: "BYE", phone: "N/A" });
  }

  // Max possible “rounds”
  const rounds = Math.min(weeks, arr.length - 1);

  for (let w = 0; w < rounds; w++) {
    const roundPairs = [];
    for (let i = 0; i < arr.length / 2; i++) {
      const caller = arr[i];
      const callee = arr[arr.length - 1 - i];

      // Skip “BYE” participants
      if (caller.name !== "BYE" && callee.name !== "BYE") {
        // Store both name & phone
        roundPairs.push({
          caller: { name: caller.name, phone: caller.phone },
          callee: { name: callee.name, phone: callee.phone },
        });
      }
    }
    schedule.push(roundPairs);

    // Rotate array
    const fixed = arr[0];
    const toRotate = arr.slice(1);
    toRotate.unshift(toRotate.pop()!);
    arr = [fixed, ...toRotate];
  }

  return schedule;
}

export async function POST(request: Request) {
  try {
    const { contacts, weeks } = await request.json();
    if (!contacts || !weeks) {
      throw new Error("Missing contacts or weeks in request body");
    }

    // Generate
    const schedule = generateRoundRobin(contacts, weeks);

    // Write to schedule.json
    const scheduleFilePath = path.join(process.cwd(), "data", "schedule.json");
    await fs.writeFile(
      scheduleFilePath,
      JSON.stringify(schedule, null, 2),
      "utf8"
    );

    return NextResponse.json({ success: true, schedule });
  } catch (err: any) {
    console.error("Error generating schedule:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Clear schedule
    const scheduleFilePath = path.join(process.cwd(), "data", "schedule.json");
    await fs.writeFile(scheduleFilePath, JSON.stringify([], null, 2), "utf8");

    // Optional: also clear contacts.json if you wish
    // const contactsFilePath = path.join(process.cwd(), "data", "contacts.json");
    // await fs.writeFile(contactsFilePath, JSON.stringify([], null, 2), "utf8");

    return NextResponse.json({ success: true, message: "Plan deleted." });
  } catch (err: any) {
    console.error("Error deleting schedule:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
