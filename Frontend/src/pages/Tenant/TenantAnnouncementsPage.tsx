import React, { useState, useEffect } from 'react';
import { Search, Megaphone, Calendar, SortAsc, X } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import AnnouncementCard from '../../components/announcements/AnnouncementCard';
import { announcementService } from '../../services/announcementService';
import { Announcement, AnnouncementFilters } from '../../types/announcement';

interface TenantAnnouncementsPageProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const TenantAnnouncementsPage: React.FC<TenantAnnouncementsPageProps> = ({
  currentPage = 'announcements',
  onNavigate
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sort state
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState<'priorityHighLow' | 'priorityLowHigh' | 'dateNewOld' | 'dateOldNew'>('priorityHighLow');

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: AnnouncementFilters = {
        audience: 'tenants',
        includeExpired: false
      };

      const response = await announcementService.getAnnouncements({
        page: 1,
        limit: 50,
        ...filters
      });
      
      setAnnouncements(response.data.announcements);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = announcements.filter(announcement => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      announcement.title.toLowerCase().includes(query) ||
      announcement.content.toLowerCase().includes(query)
    );
  });

  // Apply sorting
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    // Apply the selected sort option
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
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} userRole="tenant" />
      
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopNavbar 
          currentPage={currentPage} 
          title="Announcements"
          subtitle="Stay updated with community news and important information"
          onNotificationOpen={() => onNavigate && onNavigate('notifications')} 
          onAnnouncementOpen={(announcement) => { 
            if (announcement) { 
              // Handle specific announcement click if needed
            } else { 
              // "View All" was clicked - already on announcements page
            } 
          }}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-full">
            {/* Search and Filter */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                </div>

                {/* Sort button */}
                <button
                  onClick={() => setIsSortOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-base hover:bg-gray-50"
                >
                  <SortAsc className="w-5 h-5" />
                  Sort
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-8 grid grid-cols-2 lg:grid-cols-5 gap-6">
              {(() => {
                const priorities = announcements.reduce((acc, announcement) => {
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
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Megaphone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-base text-gray-600">Total Announcements</div>
                        <div className="text-2xl font-semibold text-gray-900">{announcements.length}</div>
                      </div>
                    </div>

                    {/* Urgent */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <div className="w-5 h-5 bg-red-500 rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-base text-gray-600">Urgent</div>
                        <div className="text-2xl font-semibold text-gray-900">{urgentCount}</div>
                      </div>
                    </div>

                    {/* High */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-base text-gray-600">High</div>
                        <div className="text-2xl font-semibold text-gray-900">{highCount}</div>
                      </div>
                    </div>

                    {/* Medium */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-base text-gray-600">Medium</div>
                        <div className="text-2xl font-semibold text-gray-900">{mediumCount}</div>
                      </div>
                    </div>

                    {/* Low */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-base text-gray-600">Low</div>
                        <div className="text-2xl font-semibold text-gray-900">{lowCount}</div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-8">
                {loading && (
                  <div className="py-8 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    Loading announcements...
                  </div>
                )}

                {error && (
                  <div className="py-4 text-center">
                    <div className="text-red-500 mb-2">{error}</div>
                    <button
                      onClick={fetchAnnouncements}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {!loading && !error && filteredAnnouncements.length === 0 && (
                  <div className="py-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchQuery ? 'No announcements found' : 'No announcements yet'}
                    </h3>
                    <p className="text-gray-500">
                      {searchQuery 
                        ? `No announcements match "${searchQuery}"` 
                        : 'Check back later for community updates and important information.'
                      }
                    </p>
                  </div>
                )}

                {!loading && !error && filteredAnnouncements.length > 0 && (
                  <div className="space-y-4">
                    {/* All announcements */}
                    <div className="space-y-4">
                      {sortedAnnouncements.map((announcement) => (
                        <AnnouncementCard
                          key={announcement._id}
                          announcement={announcement}
                          showAuthor={false}
                          compact={false}
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

      {/* Sort Modal */}
      {isSortOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Sort Announcements</h3>
              <button
                onClick={() => setIsSortOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sort"
                  value="priority"
                  checked={sortOption === 'priorityHighLow'}
                  onChange={(e) => setSortOption('priorityHighLow')}
                  className="mr-3"
                />
                Sort by Priority
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sort"
                  value="newest"
                  checked={sortOption === 'dateNewOld'}
                  onChange={(e) => setSortOption('dateNewOld')}
                  className="mr-3"
                />
                Newest First
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sort"
                  value="oldest"
                  checked={sortOption === 'dateOldNew'}
                  onChange={(e) => setSortOption('dateOldNew')}
                  className="mr-3"
                />
                Oldest First
              </label>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsSortOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsSortOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantAnnouncementsPage;