import React from 'react';
import { Building } from 'lucide-react';

interface SettingsProps {
  hotelName: string;
  setHotelName: (name: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ hotelName, setHotelName }) => {
  return (
    <div className="p-6 md:p-8 space-y-8">
      <header>
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">Customize application settings.</p>
      </header>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl">
        <h3 className="text-xl font-semibold mb-4">General Settings</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="hotelName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Hotel Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Building className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="text"
                id="hotelName"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Enter your hotel's name"
              />
            </div>
             <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              This name will be displayed on the sidebar and on printed documents like payslips.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
