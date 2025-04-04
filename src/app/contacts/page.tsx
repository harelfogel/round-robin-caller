"use client";

import { useState } from "react";

// Represents a single contact
interface Contact {
  name: string;
  phone: string;
}

export default function ContactsPage() {
  // 1) STATE HOOKS
  const [contacts, setContacts] = useState<Contact[]>([
    { name: "", phone: "" },
  ]);
  const [weeks, setWeeks] = useState<number>(1);
  const [schedule, setSchedule] = useState<any[]>([]);

  // Toggle showing/hiding the form
  const [showForm, setShowForm] = useState<boolean>(true);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // Loader states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  // 2) ADD NEW CONTACT ROW
  const addContactRow = () => {
    setContacts((prev) => [...prev, { name: "", phone: "" }]);
  };

  // 3) HANDLE CONTACT INPUT
  const handleContactChange = (
    index: number,
    field: keyof Contact,
    value: string
  ) => {
    setContacts((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // 4) ACTIVATE SCHEDULE
  const activateSchedule = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage("Generating your Shlapoky schedule...");

      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts, weeks }),
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to generate schedule");
      }

      // Store & hide form
      setSchedule(result.schedule);
      setShowForm(false);
    } catch (err) {
      console.error("Error activating schedule:", err);
      alert("Error generating schedule. Check console for details.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // 5) DELETE SCHEDULE
  const openDeleteModal = () => setShowDeleteModal(true);
  const closeDeleteModal = () => setShowDeleteModal(false);

  const confirmDeletePlan = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage("Deleting your Shlapoky plan...");

      const response = await fetch("/api/schedule", {
        method: "DELETE",
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to delete plan");
      }

      // Reset
      setSchedule([]);
      setShowForm(true);
      setContacts([{ name: "", phone: "" }]);
      setWeeks(1);
    } catch (err) {
      console.error("Error deleting schedule:", err);
      alert("Error deleting schedule. Check console for details.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
      closeDeleteModal();
    }
  };

  // 6) RENDER
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
      {/* Title */}
      <h1
        className="text-6xl font-extrabold mb-4 text-center"
        style={{ letterSpacing: "-1px" }}
      >
        Zivoosh
      </h1>
      <p className="text-green-500 font-semibold text-xl mb-8 text-center">
        Your Shlapoky Calling Companion
      </p>

      {/* FORM CARD (shown only if showForm = true) */}
      {showForm && (
        <div className="w-full max-w-2xl p-6 bg-gray-900 rounded-lg shadow space-y-6">
          {/* Weeks input */}
          <div>
            <label className="block mb-1 text-sm font-semibold">
              How many weeks?
            </label>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              pattern="[0-9]*"
              value={weeks === 0 ? "" : weeks}
              onChange={(e) => {
                const val = e.target.value;
                setWeeks(val === "" ? 0 : Number(val));
              }}
              className="w-32 p-2 rounded border border-gray-700 bg-gray-800 text-white"
            />
          </div>

          {/* Contacts */}
          <div className="space-y-4">
            {contacts.map((contact, index) => (
              <div
                key={index}
                className="p-4 bg-gray-800 rounded-xl border border-gray-700 shadow-inner transition-transform hover:scale-[1.01]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <label className="block mb-1 text-sm font-semibold">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) =>
                        handleContactChange(index, "name", e.target.value)
                      }
                      className="w-full p-2 rounded border border-gray-700 bg-gray-900 text-white"
                      placeholder="e.g. Arad Kastelino"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 text-sm font-semibold">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) =>
                        handleContactChange(index, "phone", e.target.value)
                      }
                      className="w-full p-2 rounded border border-gray-700 bg-gray-900 text-white"
                      placeholder="(050) 123-4567"
                      pattern="[\d\s()-]+"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addContactRow}
              className="px-4 py-2 bg-gray-700 rounded font-semibold transition-transform hover:scale-105 active:scale-95"
            >
              + Add Another Contact
            </button>
          </div>

          {/* Buttons row */}
          <div className="flex items-center justify-between">
            {/* ACTIVATE BUTTON with icon */}
            <button
              type="button"
              onClick={activateSchedule}
              className="px-5 py-2 bg-green-600 rounded-full font-semibold flex items-center gap-2 transition-all hover:bg-green-500 hover:scale-105 active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m7 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Activate
            </button>

            <button
              type="button"
              onClick={openDeleteModal}
              className="px-5 py-2 bg-red-600 rounded-full font-semibold flex items-center gap-2 transition-all hover:bg-red-500 hover:scale-105 active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 3L10 2h4l1 1h5v2H4V3h5zm-1 5h8m-8 4h8m-8 4h8m1 2H7a1 1 0 01-1-1V6h12v13a1 1 0 01-1 1z"
                />
              </svg>
              Delete
            </button>
          </div>
        </div>
      )}

      {/* AFTER FORM IS HIDDEN, SHOW SCHEDULE */}
      {!showForm && schedule.length > 0 && (
        <div className="mt-8 w-full max-w-3xl p-4 bg-gray-900 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-2 text-center">
            Your Shlapoky Schedule
          </h2>
          <p className="text-center text-gray-300 mb-4">
            Here’s the plan for the next {weeks} week(s)!
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-700">Week</th>
                  <th className="py-2 px-4 border-b border-gray-700">
                    Matchups
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((weekItem, weekIndex) => (
                  <tr key={weekIndex}>
                    <td className="py-2 px-4 border-b border-gray-700">
                      Week {weekIndex + 1}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-700">
                      {weekItem.map((pair: any, i: number) => (
                        <div key={i} className="mb-2">
                          <span className="font-semibold">
                            {pair.caller.name}
                          </span>{" "}
                          (
                          <a
                            href={`tel:${pair.caller.phone}`}
                            className="underline hover:text-green-400"
                          >
                            {pair.caller.phone}
                          </a>
                          ) →{" "}
                          <span className="font-semibold">
                            {pair.callee.name}
                          </span>{" "}
                          (
                          <a
                            href={`tel:${pair.callee.phone}`}
                            className="underline hover:text-green-400"
                          >
                            {pair.callee.phone}
                          </a>
                          )
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* “Start Over” button */}
          <button
            className="mt-6 px-5 py-2 bg-gray-700 rounded-full font-semibold transition-all hover:bg-gray-600 hover:scale-105 active:scale-95"
            onClick={() => {
              // Clear schedule & show form again
              setSchedule([]);
              setShowForm(true);
            }}
          >
            Start Over
          </button>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeDeleteModal}
          />
          {/* Modal card */}
          <div className="relative bg-gray-800 p-6 rounded-lg w-full max-w-md shadow">
            <h3 className="text-xl font-bold mb-4">Delete Call Plan?</h3>
            <p className="mb-6">
              Are you sure you want to delete the entire call plan?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePlan}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                {/* Trash icon (small) */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 3L10 2h4l1 1h5v2H4V3h5zm-1 5h8m-8 4h8m-8 4h8m1 2H7a1 1 0 01-1-1V6h12v13a1 1 0 01-1 1z"
                  />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
          <div className="flex flex-col items-center space-y-4 p-6 bg-gray-900 rounded">
            {/* Simple spinner */}
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-center">{loadingMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
