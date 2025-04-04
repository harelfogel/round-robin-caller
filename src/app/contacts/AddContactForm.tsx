"use client";

import { useState } from "react";

export default function AddContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Optional: handle the success response
      const data = await response.json();
      console.log("Success:", data);

      // Reset the form
      setName("");
      setPhone("");
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white">
          Name
        </label>
        <input
          id="name"
          type="text"
          className="mt-1 block w-full rounded-md bg-gray-800 text-white p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-white">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          className="mt-1 block w-full rounded-md bg-gray-800 text-white p-2"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Add Contact
      </button>
    </form>
  );
}
