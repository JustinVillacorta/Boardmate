import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onCreate: (data: any) => void;
}

const amenitiesList = [
  'Wifi', 'TV', 'Study Desk', 'Private Bathroom', 'Air Conditioning', 'Window View',
  'Mini Fridge', 'Closet/Wardrobe', 'Bed with Mattress', 'Kitchen Access', 'Laundry Access'
];

const CreateRoomModal: React.FC<Props> = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({
    roomNumber: '',
    roomType: 'Single',
    capacity: 1,
    status: 'Available',
    monthlyRent: '',
    securityDeposit: '',
    amenities: [] as string[],
    description: '',
    floor: '',
    area: ''
  });

  const [errors, setErrors] = useState<Record<string,string>>({});
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleChange = (name: string, value: any) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity) ? prev.amenities.filter(a => a !== amenity) : [...prev.amenities, amenity]
    }));
  };

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.roomNumber) e.roomNumber = 'Room number is required';
    if (!form.monthlyRent) e.monthlyRent = 'Monthly rent is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleClear = () => {
    setForm({
      roomNumber: '',
      roomType: 'Single',
      capacity: 1,
      status: 'Available',
      monthlyRent: '',
      securityDeposit: '',
      amenities: [],
      description: '',
      floor: '',
      area: ''
    });
    setErrors({});
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onCreate(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="fixed inset-0 bg-black opacity-40 z-0" onClick={onClose} />

  <div ref={modalRef} className="relative w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[90vh] z-10">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">Create New Room</h3>
            <p className="text-sm text-gray-500">Add a new room to the boarding house. Complete all required information below.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

  <div className="p-4 overflow-y-auto flex-1">
          {/* Basic Information */}
          <section className="mb-6">
            <h4 className="text-sm font-semibold mb-2">Basic Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600">Room Number *</label>
                <input value={form.roomNumber} onChange={e => handleChange('roomNumber', e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
                {errors.roomNumber && <p className="text-xs text-red-500 mt-1">{errors.roomNumber}</p>}
              </div>

              <div>
                <label className="block text-xs text-gray-600">Room Type</label>
                <select value={form.roomType} onChange={e => handleChange('roomType', e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                  <option>Single</option>
                  <option>Double</option>
                  <option>Studio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-600">Capacity</label>
                <input type="number" min={1} value={form.capacity} onChange={e => handleChange('capacity', Number(e.target.value))} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Status</label>
                <select value={form.status} onChange={e => handleChange('status', e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                  <option>Available</option>
                  <option>Occupied</option>
                  <option>Maintenance</option>
                </select>
              </div>
            </div>
          </section>

          {/* Pricing Info */}
          <section className="mb-6">
            <h4 className="text-sm font-semibold mb-2">Pricing Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600">Monthly Rent *</label>
                <input value={form.monthlyRent} onChange={e => handleChange('monthlyRent', e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
                {errors.monthlyRent && <p className="text-xs text-red-500 mt-1">{errors.monthlyRent}</p>}
              </div>

              <div>
                <label className="block text-xs text-gray-600">Security Deposit</label>
                <input value={form.securityDeposit} onChange={e => handleChange('securityDeposit', e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
          </section>

          {/* Amenities */}
          <section className="mb-6">
            <h4 className="text-sm font-semibold mb-2">Room Amenities</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {amenitiesList.map(a => (
                <button
                  type="button"
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  aria-pressed={form.amenities.includes(a)}
                  className={`cursor-pointer text-sm px-3 py-2 border rounded-lg text-left ${form.amenities.includes(a) ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                  {a}
                </button>
              ))}
            </div>
              <div className="mt-3">
                <div className="text-xs text-gray-500">Selected Amenities:</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.amenities.map(a => (
                    <span key={a} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{a}</span>
                  ))}
                </div>
              </div>
          </section>

          {/* Description */}
          <section className="mb-6">
            <h4 className="text-sm font-semibold mb-2">Room Description</h4>
            <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Additional room description (optional)" />
          </section>

          {/* Additional Info */}
          <section>
            <h4 className="text-sm font-semibold mb-2">Additional Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600">Floor</label>
                <input value={form.floor} onChange={e => handleChange('floor', e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Area (sq. meters)</label>
                <input value={form.area} onChange={e => handleChange('area', e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex-shrink-0 flex items-center justify-end gap-3">
          <button type="button" onClick={handleClear} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">Clear</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;
