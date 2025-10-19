import React from 'react';

type Props = {
  open: boolean;
  onCreate: (payload: { title: string; message?: string }) => void;
  onCancel: () => void;
};

const CreateAnnouncementForm: React.FC<Props> = ({ open, onCreate, onCancel }) => {
  const [title, setTitle] = React.useState('Maintenance Notice');
  const [message, setMessage] = React.useState('Message');

  const clear = () => {
    setTitle('');
    setMessage('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 z-50 relative">
        <button onClick={onCancel} aria-label="Close" className="absolute right-3 top-3 text-gray-500 hover:text-gray-700">
          ×
        </button>
        <h3 className="text-lg font-semibold mb-4">Create Announcement</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full border rounded px-3 py-2 mt-1" />
          </div>

          {/* expiresAt removed per request */}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={clear} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">Clear</button>
          <button onClick={() => onCreate({ title, message: message || undefined })} className="px-4 py-2 bg-blue-600 text-white rounded">
            Create Announcement
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAnnouncementForm;
