import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserMinus, Upload, FileText, Wand2, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import * as roomManagementService from '../../services/roomManagementService';
import RemoveTenantConfirmDialog from './RemoveTenantConfirmDialog';

interface RoomData {
  id: string;
  name: string;
  type: string;
  rent: string;
  capacity: number;
  occupancy: string;
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
  description?: string;
  tenants?: Array<{
    id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
  }>;
}

interface Props {
  room: RoomData;
  onClose: () => void;
  onAddTenant?: (roomId: string) => void;
}

type Step = 1 | 2 | 3;

const ManageTenantsModal: React.FC<Props> = ({ room, onClose, onAddTenant }) => {
  const [current, total] = room.occupancy.split('/').map(s => Number(s));
  const available = Math.max(0, total - current);

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1: Select Tenant
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
  const [availableTenants, setAvailableTenants] = useState<any[]>([]);

  // Step 2: Contract
  const [contractMethod, setContractMethod] = useState<'generate' | 'upload' | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [contractError, setContractError] = useState<string | null>(null);
  
  // Contract generation form
  const [genFormData, setGenFormData] = useState({
    leaseDurationMonths: 12,
    leaseStartDate: new Date().toISOString().split('T')[0],
    monthlyRent: parseFloat(room.rent.replace(/[^\d.]/g, '')),
    securityDeposit: 0,
    landlordName: '',
    landlordAddress: '',
    specialTerms: ''
  });

  // Step 3: Confirm
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingContract, setIsGeneratingContract] = useState(false);

  // Tenant removal
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [tenantToRemove, setTenantToRemove] = useState<string | null>(null);

  // Fetch available tenants
  const fetchAvailableTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await roomManagementService.getAvailableTenants();
      const dataAny: any = response.data;
      const allTenants: any[] = dataAny.records || dataAny.tenants || [];
      const filtered = allTenants.filter((tenant: any) => !tenant.room && !tenant.isArchived);
      setAvailableTenants(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch available tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStep === 1) {
      fetchAvailableTenants();
    }
  }, [currentStep]);

  const toggleTenantSelect = (id: string) => {
    setSelectedTenantIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= available) return prev;
      return [...prev, id];
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setContractError(null);
    
    if (!file) {
      setContractFile(null);
      return;
    }
    
    if (file.type !== 'application/pdf') {
      setContractError('Only PDF files are allowed');
      setContractFile(null);
      return;
    }
    
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setContractError('File size must not exceed 10MB');
      setContractFile(null);
      return;
    }
    
    setContractFile(file);
  };

  const handleGenerateContract = async () => {
    if (!genFormData.landlordName.trim() || !genFormData.landlordAddress.trim()) {
      setContractError('Landlord name and address are required');
      return;
    }

    try {
      setIsGeneratingContract(true);
      setContractError(null);
      
      const selectedTenant = availableTenants.find(t => t._id === selectedTenantIds[0]);
      const response = await roomManagementService.generateContract({
        tenantId: selectedTenantIds[0],
        roomId: room.id,
        leaseDurationMonths: genFormData.leaseDurationMonths,
        leaseStartDate: genFormData.leaseStartDate,
        monthlyRent: genFormData.monthlyRent,
        securityDeposit: genFormData.securityDeposit,
        landlordName: genFormData.landlordName,
        landlordAddress: genFormData.landlordAddress,
        specialTerms: genFormData.specialTerms
      });

      // Convert base64 to File
      const byteCharacters = atob(response.data.contractFile.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const file = new File([blob], response.data.contractFileName, { type: 'application/pdf' });
      
      setContractFile(file);
    } catch (err: any) {
      setContractError(err?.response?.data?.message || err?.message || 'Failed to generate contract');
    } finally {
      setIsGeneratingContract(false);
    }
  };

  const handleFinalAssign = async () => {
    if (selectedTenantIds.length === 0 || !contractFile) return;
    
    try {
      setLoading(true);
      const tenantId = selectedTenantIds[0];
      const leaseEndDate = new Date(genFormData.leaseStartDate);
      leaseEndDate.setMonth(leaseEndDate.getMonth() + genFormData.leaseDurationMonths);
      
      await roomManagementService.assignTenant(room.id, {
        tenantId,
        leaseStartDate: genFormData.leaseStartDate,
        leaseEndDate: leaseEndDate.toISOString().split('T')[0],
        contractFile: await roomManagementService.fileToBase64(contractFile),
        contractFileName: contractFile.name
      });
      
      onAddTenant && onAddTenant(room.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign tenant');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedTenant = () => availableTenants.find(t => t._id === selectedTenantIds[0]);

  const canGoToNextStep = () => {
    switch (currentStep) {
      case 1:
        return selectedTenantIds.length > 0;
      case 2:
        return contractFile !== null;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleRemoveTenant = (tenantId: string) => {
    setTenantToRemove(tenantId);
    setIsRemoveOpen(true);
  };

  const confirmRemoveTenant = async () => {
    if (!tenantToRemove) return;
    
    try {
      setLoading(true);
      await roomManagementService.removeTenant(room.id, tenantToRemove);
      onAddTenant && onAddTenant(room.id);
      setIsRemoveOpen(false);
      setTenantToRemove(null);
    } catch (err: any) {
      setError(err.message || 'Failed to remove tenant');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressIndicator = () => {
    const steps = [
      { num: 1, label: 'Select Tenant' },
      { num: 2, label: 'Contract' },
      { num: 3, label: 'Confirm' }
    ];

    return (
      <div className="flex items-center justify-center py-4 border-b">
        {steps.map((step, index) => (
          <React.Fragment key={step.num}>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                currentStep >= step.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step.num}
              </div>
              <span className={`ml-2 text-sm ${currentStep >= step.num ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${currentStep > step.num ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black opacity-40" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between p-6 border-b flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold">Manage Room Tenants</h3>
            <p className="text-sm text-gray-500">{room.name} - {room.occupancy} occupied</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {renderProgressIndicator()}

        <div className="p-6 overflow-y-auto flex-1">
          {/* Step 1: Select Tenant */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600">Capacity</div>
                  <div className="text-2xl font-semibold text-blue-800">{room.capacity}</div>
                  <div className="text-xs text-blue-500">Total spots</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600">Occupied</div>
                  <div className="text-2xl font-semibold text-green-800">{current}</div>
                  <div className="text-xs text-green-500">Current tenants</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-600">Available</div>
                  <div className="text-2xl font-semibold text-red-800">{available}</div>
                  <div className="text-xs text-red-500">Room is {available === 0 ? 'full' : 'available'}</div>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-green-700 mb-3">Select Tenant</h4>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading available tenants...</div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-red-600 mb-2">{error}</div>
                  <button onClick={fetchAvailableTenants} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                    Retry
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableTenants.map(tenant => {
                    const isSelected = selectedTenantIds.includes(tenant._id);
                    return (
                      <button
                        key={tenant._id}
                        onClick={() => toggleTenantSelect(tenant._id)}
                        className={`w-full text-left p-3 rounded-lg border flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-blue-50 border-blue-400' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{tenant.firstName} {tenant.lastName}</div>
                          <div className="text-xs text-gray-500">{tenant.email}</div>
                          {tenant.phoneNumber && (
                            <div className="text-xs text-gray-400">{tenant.phoneNumber}</div>
                          )}
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Contract */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {!contractMethod ? (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    onClick={() => setContractMethod('generate')}
                    className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
                  >
                    <Wand2 className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                    <div className="font-medium text-purple-700">Generate Contract</div>
                    <div className="text-sm text-gray-500 mt-1">Auto-generate a lease agreement</div>
                  </button>
                  <button
                    onClick={() => setContractMethod('upload')}
                    className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <Upload className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                    <div className="font-medium text-blue-700">Upload Contract</div>
                    <div className="text-sm text-gray-500 mt-1">Upload an existing PDF contract</div>
                  </button>
                </div>
              ) : contractMethod === 'generate' ? (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-4">Contract Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lease Duration (Months)</label>
                        <select
                          value={genFormData.leaseDurationMonths}
                          onChange={(e) => setGenFormData({...genFormData, leaseDurationMonths: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="6">6 months</option>
                          <option value="12">12 months</option>
                          <option value="18">18 months</option>
                          <option value="24">24 months</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={genFormData.leaseStartDate}
                          onChange={(e) => setGenFormData({...genFormData, leaseStartDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (₱)</label>
                          <input
                            type="number"
                            value={genFormData.monthlyRent}
                            onChange={(e) => setGenFormData({...genFormData, monthlyRent: parseFloat(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (₱)</label>
                          <input
                            type="number"
                            value={genFormData.securityDeposit}
                            onChange={(e) => setGenFormData({...genFormData, securityDeposit: parseFloat(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Landlord Name</label>
                        <input
                          type="text"
                          value={genFormData.landlordName}
                          onChange={(e) => setGenFormData({...genFormData, landlordName: e.target.value})}
                          placeholder="Enter landlord/owner name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
                        <textarea
                          value={genFormData.landlordAddress}
                          onChange={(e) => setGenFormData({...genFormData, landlordAddress: e.target.value})}
                          rows={2}
                          placeholder="Enter complete property address"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Special Terms (Optional)</label>
                        <textarea
                          value={genFormData.specialTerms}
                          onChange={(e) => setGenFormData({...genFormData, specialTerms: e.target.value})}
                          rows={2}
                          placeholder="Any additional terms or conditions"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <button
                        onClick={handleGenerateContract}
                        disabled={isGeneratingContract}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        {isGeneratingContract ? 'Generating...' : 'Generate Contract'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                    <input type="file" id="contractFile" accept=".pdf" onChange={handleFileChange} className="hidden" />
                    <label htmlFor="contractFile" className="flex flex-col items-center justify-center cursor-pointer">
                      {contractFile ? (
                        <div className="flex items-center gap-2 text-blue-600">
                          <FileText className="w-5 h-5" />
                          <span className="font-medium">{contractFile.name}</span>
                          <span className="text-sm text-gray-500">({(contractFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Click to upload PDF</span>
                          <span className="text-xs text-gray-400">Max size: 10MB</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              )}
              
              {contractError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {contractError}
                </div>
              )}

              {contractFile && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-700">Contract ready: {contractFile.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {currentStep === 3 && getSelectedTenant() && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg mb-4">Review Assignment</h4>
              
              <div className="border rounded-lg p-4 space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Tenant</div>
                  <div className="font-medium">{getSelectedTenant()?.firstName} {getSelectedTenant()?.lastName}</div>
                  <div className="text-sm text-gray-600">{getSelectedTenant()?.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Room</div>
                  <div className="font-medium">{room.name} ({room.type})</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Lease Period</div>
                  <div className="font-medium">
                    {new Date(genFormData.leaseStartDate).toLocaleDateString()} - {' '}
                    {(() => {
                      const endDate = new Date(genFormData.leaseStartDate);
                      endDate.setMonth(endDate.getMonth() + genFormData.leaseDurationMonths);
                      return endDate.toLocaleDateString();
                    })()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Financial Terms</div>
                  <div className="font-medium">
                    Monthly Rent: ₱{genFormData.monthlyRent.toLocaleString()} | 
                    Security Deposit: ₱{genFormData.securityDeposit.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Contract</div>
                  <div className="font-medium">{contractFile?.name}</div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mt-4">
              {error}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-white flex-shrink-0 flex items-center justify-between">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <button
                onClick={() => {
                  if (currentStep === 2) setContractMethod(null);
                  setCurrentStep((currentStep - 1) as Step);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
          </div>
          
          <div>
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep((currentStep + 1) as Step)}
                disabled={!canGoToNextStep()}
                className={`px-6 py-2 rounded-md text-white flex items-center gap-2 ${
                  canGoToNextStep() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinalAssign}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Assigning...' : 'Assign Tenant'}
              </button>
            )}
          </div>
        </div>
      </div>

      <RemoveTenantConfirmDialog
        isOpen={isRemoveOpen}
        tenantName={tenantToRemove ? room.tenants?.find(t => t.id === tenantToRemove)?.name : undefined}
        roomName={room.name}
        loading={loading}
        onConfirm={confirmRemoveTenant}
        onCancel={() => {
          setIsRemoveOpen(false);
          setTenantToRemove(null);
        }}
      />
    </div>
  );
};

export default ManageTenantsModal;

