"use client";

import { useState } from "react";
import NewBrewForm from "../components/NewBrewForm";
import BrewSessionList from "../components/BrewSessionList";
import BrewSessionDetail from "../components/BrewSessionDetail";
import { BrewSession, UserBrewingDevice } from "@/app/types";

type Props = {
  userId: string;
  userDevices: UserBrewingDevice[];
  initialBrewSessions: any[]; // Use any[] to avoid type conflicts
  initialSelectedSessionId?: string;
  selectedSession?: any | null; // Use any to avoid type conflicts
};

export default function BrewLogContent({
  userId,
  userDevices: initialUserDevices,
  initialBrewSessions,
  initialSelectedSessionId,
  selectedSession,
}: Props) {
  const [brewSessions, setBrewSessions] = useState<any[]>(initialBrewSessions); // Use any[] here
  const [userDevices, setUserDevices] =
    useState<UserBrewingDevice[]>(initialUserDevices);
  const [selectedSessionState, setSelectedSession] = useState<any | null>(
    selectedSession ||
      (initialSelectedSessionId
        ? brewSessions.find((s) => s.id === initialSelectedSessionId) || null
        : null)
  );
  const [showNewForm, setShowNewForm] = useState(false);

  const handleNewBrewSession = (newSession: any) => {
    setBrewSessions([newSession, ...brewSessions]);
    setShowNewForm(false);
    setSelectedSession(newSession);
  };

  const handleUpdateBrewSession = (updatedSession: any) => {
    setBrewSessions(
      brewSessions.map((session) =>
        session.id === updatedSession.id ? updatedSession : session
      )
    );
    setSelectedSession(updatedSession);
  };

  const handleDeleteBrewSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/brew-sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBrewSessions(
          brewSessions.filter((session) => session.id !== sessionId)
        );
        setSelectedSession(null);
      } else {
        console.error("Failed to delete brew session");
      }
    } catch (error) {
      console.error("Error deleting brew session:", error);
    }
  };

  const handleDeviceAdded = (newDevice: UserBrewingDevice) => {
    setUserDevices((prevDevices) => [...prevDevices, newDevice]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Brews</h2>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="btn btn-primary btn-sm"
          >
            {showNewForm ? "Cancel" : "New Brew"}
          </button>
        </div>

        {showNewForm ? (
          <NewBrewForm
            userId={userId}
            userDevices={userDevices}
            onBrewCreated={handleNewBrewSession}
            onDeviceAdded={handleDeviceAdded}
          />
        ) : (
          <BrewSessionList
            sessions={brewSessions}
            selectedSessionId={selectedSessionState?.id}
            onSelectSession={(session) =>
              setSelectedSession(session as BrewSession)
            }
          />
        )}
      </div>

      <div className="md:col-span-2">
        {selectedSessionState ? (
          <BrewSessionDetail
            session={selectedSessionState}
            onUpdate={handleUpdateBrewSession}
            onDelete={handleDeleteBrewSession}
          />
        ) : (
          <div className="bg-gray-50 coffee:bg-gray-800 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-500 coffee:text-gray-400">
              Select a brew session to view details or create a new one
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
