import React, { useState } from 'react';
import { Employee, EmployeeHistoryEvent, EventType } from '../types';
import { X, Plus, Calendar, Type, DollarSign } from 'lucide-react';

interface EmployeeHistoryModalProps {
  employee: Employee;
  history: EmployeeHistoryEvent[];
  onAddEvent: (event: Omit<EmployeeHistoryEvent, 'id'>) => void;
  onClose: () => void;
}

const EventTypeIcon = ({ type }: { type: EventType }) => {
    const iconMap = {
        [EventType.PROMOTION]: '🏆',
        [EventType.PENALTY]: ' штраф', // Farsi for fine - just kidding, let's use emoji
        [EventType.SALARY_CHANGE]: '💰',
        [EventType.NOTE]: '📝',
        [EventType.HIRED]: '🎉',
    };
    const colorMap = {
        [EventType.PROMOTION]: 'bg-green-100 dark:bg-green-900',
        [EventType.PENALTY]: 'bg-red-100 dark:bg-red-900',
        [EventType.SALARY_CHANGE]: 'bg-yellow-100 dark:bg-yellow-900',
        [EventType.NOTE]: 'bg-blue-100 dark:bg-blue-900',
        [EventType.HIRED]: 'bg-purple-100 dark:bg-purple-900',
    }

    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorMap[type] || 'bg-gray-100'}`}>
            <span className="text-xl">{iconMap[type] || '📄'}</span>
        </div>
    );
};


const EmployeeHistoryModal: React.FC<EmployeeHistoryModalProps> = ({ employee, history, onAddEvent, onClose }) => {
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    date: new Date().toISOString().split('T')[0],
    type: EventType.NOTE,
    description: '',
    amount: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.description.trim() === '') {
      alert('Description cannot be empty.');
      return;
    }
    onAddEvent({
      employeeId: employee.id,
      ...newEvent,
    });
    // Reset form
    setNewEvent({
      date: new Date().toISOString().split('T')[0],
      type: EventType.NOTE,
      description: '',
      amount: 0,
    });
    setShowForm(false);
  };
  
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Employee History</h2>
            <p className="text-gray-500 dark:text-gray-400">{employee.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X size={24} />
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 space-y-4">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors mb-4"
            >
              <Plus size={20} />
              Add New History Event
            </button>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4 mb-6">
              <h3 className="text-lg font-semibold">New Event</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block mb-1 text-sm font-medium">Date</label>
                  <input type="date" name="date" value={newEvent.date} onChange={handleInputChange} className="form-input" required />
                </div>
                <div>
                  <label htmlFor="type" className="block mb-1 text-sm font-medium">Event Type</label>
                  <select name="type" value={newEvent.type} onChange={handleInputChange} className="form-input" required>
                    {Object.values(EventType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="description" className="block mb-1 text-sm font-medium">Description</label>
                <textarea name="description" value={newEvent.description} onChange={handleInputChange} className="form-input w-full" rows={3} required />
              </div>
              {(newEvent.type === EventType.PENALTY || newEvent.type === EventType.SALARY_CHANGE) && (
                <div>
                  <label htmlFor="amount" className="block mb-1 text-sm font-medium">Amount (USD)</label>
                  <input type="number" name="amount" value={newEvent.amount} onChange={handleInputChange} className="form-input" />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Event</button>
              </div>
            </form>
          )}

          {/* Timeline */}
          <div className="space-y-6">
            {sortedHistory.length > 0 ? sortedHistory.map(event => (
              <div key={event.id} className="flex items-start gap-4">
                <EventTypeIcon type={event.type} />
                <div className="flex-1">
                  <p className="font-semibold">{event.type}
                    {event.amount ? <span className="text-gray-500 dark:text-gray-400 font-normal"> - ${event.amount.toLocaleString()}</span> : ''}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(event.date).toLocaleDateString()}</p>
                  <p className="mt-1 text-sm">{event.description}</p>
                </div>
              </div>
            )) : (
                <div className="text-center py-8 text-gray-500">
                    <p>No history records found for this employee.</p>
                </div>
            )}
          </div>
        </main>
      </div>
       <style>{`.form-input { width: 100%; padding: 0.5rem 0.75rem; background-color: rgb(249 250 251); border: 1px solid rgb(209 213 219); border-radius: 0.5rem; color: rgb(17 24 39); } .dark .form-input { background-color: rgb(75 85 99); border-color: rgb(107 114 128); color: white; }`}</style>
    </div>
  );
};

export default EmployeeHistoryModal;
