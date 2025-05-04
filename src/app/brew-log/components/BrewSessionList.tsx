'use client';

import { format } from 'date-fns';

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
  createdAt: string;
  updatedAt: string;
};

type Props = {
  sessions: BrewSession[];
  selectedSessionId: string | undefined;
  onSelectSession: (session: BrewSession) => void;
};

export default function BrewSessionList({ 
  sessions, 
  selectedSessionId, 
  onSelectSession 
}: Props) {
  if (sessions.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          You haven&apos;t logged any brews yet.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {sessions.map((session) => (
          <li 
            key={session.id}
            className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
              selectedSessionId === session.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
            onClick={() => onSelectSession(session)}
          >
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">
                  {session.name}
                </p>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {session.brewingDevice.name}
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    {session.notes.length > 30 
                      ? `${session.notes.substring(0, 30)}...` 
                      : session.notes || 'No notes'}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <p>
                    {format(new Date(session.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}