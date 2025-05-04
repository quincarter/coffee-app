"use client";

import BrewItem from "@/app/components/BrewItem";

type BrewSession = {
  id: string;
  name: string;
  notes: string;
  userId: string;
  brewingDeviceId: string;
  brewingDevice: {
    name: string;
    image: string;
  };
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  sessions: BrewSession[];
  selectedSessionId: string | undefined;
  onSelectSession: (session: BrewSession) => void;
  variant?: "list" | "card" | "timeline";
};

export default function BrewSessionList({
  sessions,
  selectedSessionId,
  onSelectSession,
  variant = "list"
}: Props) {
  if (sessions.length === 0) {
    return (
      <div className="bg-gray-50 coffee:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-500 coffee:text-gray-400">
          You haven&apos;t logged any brews yet.
        </p>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <BrewItem
            key={session.id}
            session={session}
            isSelected={selectedSessionId === session.id}
            onClick={() => onSelectSession(session)}
            variant="card"
          />
        ))}
      </div>
    );
  }
  
  if (variant === "timeline") {
    return (
      <div className="flow-root">
        <ul className="-mb-8">
          {sessions.map((session) => (
            <li key={session.id}>
              <BrewItem
                session={session}
                isSelected={selectedSessionId === session.id}
                onClick={() => onSelectSession(session)}
                variant="timeline"
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Default list variant
  return (
    <div className="bg-white coffee:bg-gray-800 rounded-lg shadow overflow-hidden">
      <ul className="divide-y divide-gray-200 coffee:divide-gray-700">
        {sessions.map((session) => (
          <li key={session.id}>
            <BrewItem
              session={session}
              isSelected={selectedSessionId === session.id}
              onClick={() => onSelectSession(session)}
              variant="list"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
