import React, { useState, useEffect } from 'react';
import { Plus, Search, SortAsc, Megaphone } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import AnnouncementCard from '../../components/announcements/AnnouncementCard';
import CreateAnnouncementModal from '../../components/announcements/CreateAnnouncementModal';
import { announcementService } from '../../services/announcementService';
import { Announcement, AnnouncementFilters } from '../../types/announcement';

interface AnnouncementsPageProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  userRole?: 'admin' | 'staff';
}

const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({
  currentPage,
  onNavigate,
  userRole = 'admin'
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Sort state
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState<'priorityHighLow' | 'priorityLowHigh' | 'dateNewOld' | 'dateOldNew'>('priorityHighLow');

  // Filters - simplified for staff/tenant, full for admin
  const [filters, setFilters] = useState<AnnouncementFilters>(() => {
    if (userRole === 'admin') {
      return {
        audience: 'all',
        includeExpired: false
      };
    } else {
      // Staff and tenant get audience-based filtering
      return {
        audience: userRole === 'staff' ? 'staff' : 'tenants',
        includeExpired: false
      };
    }
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: 1,
        limit: 50,
        ...filters
      };

      const response = await announcementService.getAnnouncements(params);
      setAnnouncements(response.data.announcements);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [filters]);

  const handleCreateAnnouncement = async (formData: any) => {
    setIsCreating(true);
    try {
      await announcementService.createAnnouncement(formData);
      setShowCreateModal(false);
      await fetchAnnouncements();
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || err?.message || 'Failed to create announcement');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAnnouncement = async (announcement: Announcement) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      await announcementService.deleteAnnouncement(announcement._id);
      await fetchAnnouncements();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete announcement');
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      announcement.title.toLowerCase().includes(query) ||
      announcement.content.toLowerCase().includes(query) ||
      announcement.author.name.toLowerCase().includes(query)
    );
  });

  // Apply sorting
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    // Then apply the selected sort option
    const getPriorityValue = (priority: string) => {
      switch (priority) {
        case 'urgent': return 4;
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
        default: return 0;
      }
    };

    if (sortOption === 'priorityHighLow') {
      const priorityDiff = getPriorityValue(b.priority) - getPriorityValue(a.priority);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    }

    if (sortOption === 'priorityLowHigh') {
      const priorityDiff = getPriorityValue(a.priority) - getPriorityValue(b.priority);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    }

    if (sortOption === 'dateNewOld') {
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    }

    if (sortOption === 'dateOldNew') {
      return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
    }

    return 0;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} userRole={userRole} />
      
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopNavbar 
          currentPage={currentPage} 
          title="Announcements"
          subtitle={userRole === 'admin' ? "Create and manage announcements for your community" : "View community announcements and updates"}
          onNotificationOpen={() => onNavigate && onNavigate('notifications')} 
        />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-full">
            {/* Header */}
            <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Megaphone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
                  <p className="text-sm text-gray-500">Manage community announcements and communications</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                </div>

                {/* Sort button */}
                <button
                  onClick={() => setIsSortOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm hover:bg-gray-50"
                >
                  <SortAsc className="w-4 h-4" />
                  Sort
                </button>

                {/* Create button */}
                {userRole === 'admin' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create</span>
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 lg:grid-cols-5 gap-4">
              {(() => {
                const priorities = sortedAnnouncements.reduce((acc, announcement) => {
                  acc[announcement.priority] = (acc[announcement.priority] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                
                const urgentCount = priorities.urgent || 0;
                const highCount = priorities.high || 0;
                const mediumCount = priorities.medium || 0;
                const lowCount = priorities.low || 0;
                
                return (
                  <>
                    {/* Total Announcements */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Megaphone className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Total Announcements</div>
                        <div className="text-2xl font-semibold text-gray-900">{sortedAnnouncements.length}</div>
                      </div>
                    </div>

                    {/* Urgent */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Urgent</div>
                        <div className="text-2xl font-semibold text-gray-900">{urgentCount}</div>
                      </div>
                    </div>

                    {/* High */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">High</div>
                        <div className="text-2xl font-semibold text-gray-900">{highCount}</div>
                      </div>
                    </div>

                    {/* Medium */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Medium</div>
                        <div className="text-2xl font-semibold text-gray-900">{mediumCount}</div>
                      </div>
                    </div>

                    {/* Low */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Low</div>
                        <div className="text-2xl font-semibold text-gray-900">{lowCount}</div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                {loading && (
                  <div className="py-8 text-center text-gray-500">Loading announcements...</div>
                )}

                {error && (
                  <div className="py-4 text-center text-red-500">{error}</div>
                )}

                {!loading && !error && sortedAnnouncements.length === 0 && (
                  <div className="py-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Megaphone className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchQuery ? 'No announcements found' : 'No announcements yet'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery 
                        ? `No announcements match "${searchQuery}"` 
                        : 'Create your first announcement to get started.'
                      }
                    </p>
                    {!searchQuery && userRole === 'admin' && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Create Announcement
                      </button>
                    )}
                  </div>
                )}

                {!loading && !error && sortedAnnouncements.length > 0 && (
                  <div className="space-y-4">
                    {/* All announcements */}
                    <div className="grid gap-4">
                      {filteredAnnouncements.map((announcement) => (
                        <AnnouncementCard
                          key={announcement._id}
                          announcement={announcement}
                          showAuthor={true}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Create Modal */}
      <CreateAnnouncementModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAnnouncement}
        isLoading={isCreating}
      />

      {/* Sort Floating Panel */}
      {isSortOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0" onClick={() => setIsSortOpen(false)} />
          <div className="absolute right-6 top-20 w-80 bg-white border border-gray-200 p-4 rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Sort Announcements</h3>
              <button onClick={() => setIsSortOpen(false)} className="text-gray-500 text-xl leading-none">×</button>
            </div>

            <div className="space-y-3">
              {/* Priority sorting */}
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="announcementSort" 
                  value="priorityHighLow" 
                  checked={sortOption === 'priorityHighLow'} 
                  onChange={() => setSortOption('priorityHighLow')} 
                />
                <span className="text-sm">Priority (High → Low)</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="announcementSort" 
                  value="priorityLowHigh" 
                  checked={sortOption === 'priorityLowHigh'} 
                  onChange={() => setSortOption('priorityLowHigh')} 
                />
                <span className="text-sm">Priority (Low → High)</span>
              </label>

              {/* Date sorting */}
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="announcementSort" 
                  value="dateNewOld" 
                  checked={sortOption === 'dateNewOld'} 
                  onChange={() => setSortOption('dateNewOld')} 
                />
                <span className="text-sm">Date (Newest → Oldest)</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="announcementSort" 
                  value="dateOldNew" 
                  checked={sortOption === 'dateOldNew'} 
                  onChange={() => setSortOption('dateOldNew')} 
                />
                <span className="text-sm">Date (Oldest → Newest)</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;