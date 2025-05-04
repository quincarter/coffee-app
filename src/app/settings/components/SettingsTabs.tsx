'use client';

import { useState } from 'react';
import BrewingDevicesTab from './BrewingDevicesTab';
import AdminPanel from './AdminPanel';

type Tab = 'brewing-devices' | 'profile' | 'preferences' | 'admin';

export default function SettingsTabs({ userId, userRole }: { userId: string; userRole: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('brewing-devices');
  
  return (
    <div>
      <div className="mb-6 border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('brewing-devices')}
            className={`border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'brewing-devices'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Brewing Devices
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'preferences'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Preferences
          </button>
          {userRole === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                activeTab === 'admin'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Admin
            </button>
          )}
        </nav>
      </div>
      
      <div className="py-4">
        {activeTab === 'brewing-devices' && <BrewingDevicesTab userId={userId} />}
        {activeTab === 'profile' && <div>Profile settings coming soon</div>}
        {activeTab === 'preferences' && <div>Preferences settings coming soon</div>}
        {activeTab === 'admin' && userRole === 'admin' && <AdminPanel />}
      </div>
    </div>
  );
}
