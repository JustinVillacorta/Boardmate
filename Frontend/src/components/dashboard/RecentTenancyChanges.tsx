import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { userManagementService } from '../../services/userManagementService';

interface TenantData {
  id: string;
  name: string;
  room: string;
  startDate: string;
  status: 'Active' | 'Inactive';
}

interface RecentTenancyChangesProps {
  className?: string;
}

const RecentTenancyChanges: React.FC<RecentTenancyChangesProps> = ({ className = '' }) => {
  const [recentTenants, setRecentTenants] = useState<TenantData[]>([]);
  const [occupancyPercentage, setOccupancyPercentage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Fetch recent tenants sorted by updatedAt
        const response = await userManagementService.getStaffAndTenants({
          userType: 'tenant',
          limit: 5,
          sortBy: 'updatedAt',
          sortOrder: 'desc'
        });
        
        if (isMounted && response.data?.records) {
          const mapped: TenantData[] = response.data.records.map((u: any) => ({
            id: u._id,
            name: u.fullName || `${u.firstName} ${u.lastName}`,
            room: u.room?.roomNumber || 'N/A',
            startDate: u.leaseStartDate 
              ? new Date(u.leaseStartDate).toLocaleDateString() 
              : 'N/A',
            status: u.tenantStatus === 'active' ? 'Active' : 'Inactive'
          }));
          setRecentTenants(mapped);
          
          // Calculate occupancy from tenant data
          const tenantsWithRooms = mapped.filter(t => t.room !== 'N/A').length;
          const totalTenants = mapped.length;
          const percentage = totalTenants > 0 ? Math.round((tenantsWithRooms / totalTenants) * 100) : 0;
          setOccupancyPercentage(percentage);
        }
      } catch (e) {
        console.error('RecentTenancyChanges: Failed to fetch recent tenancy changes:', e);
        // Set empty state on error
        if (isMounted) {
          setRecentTenants([]);
          setOccupancyPercentage(0);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Tenancy Changes</h3>
            <p className="text-sm text-gray-500 mt-1">Latest updates to tenant assignments</p>
          </div>
          
          {/* Occupancy Circle */}
          <div className="flex flex-col items-center sm:items-end">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${occupancyPercentage}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-semibold text-blue-600">{occupancyPercentage}%</span>
              </div>
            </div>
            <span className="text-xs text-gray-500 mt-1">Space Occupied</span>
          </div>
        </div>
      </div>

      {/* Tenant List */}
      <div className="p-4 lg:p-6">
        {loading ? (
          <div className="text-gray-500 text-sm">Loading recent changes...</div>
        ) : recentTenants.length === 0 ? (
          <div className="text-gray-500 text-sm">No recent tenant activity</div>
        ) : (
          <div className="space-y-4">
            {recentTenants.map((tenant) => (
            <div key={tenant.id} className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              {/* Avatar */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </div>
              
              {/* Tenant Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{tenant.name}</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Room Badge */}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Room {tenant.room}
                    </span>
                    {/* Status Badge */}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      tenant.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tenant.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Started {tenant.startDate}</p>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTenancyChanges;
