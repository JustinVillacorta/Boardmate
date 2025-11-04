import React from 'react';
import { Calendar, User, AlertCircle } from 'lucide-react';
import { Announcement } from '../../types/announcement';
import { announcementService } from '../../services/announcementService';

interface AnnouncementCardProps {
  announcement: Announcement;
  onOpen?: (announcement: Announcement) => void;
  selected?: boolean;
  showAuthor?: boolean;
  compact?: boolean;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onOpen,
  selected = false,
  showAuthor = true,
  compact = false
}) => {
  const handleClick = async () => {
    // Mark as read when clicked
    try {
      await announcementService.markAsRead(announcement._id || announcement.id);
    } catch (error) {
      console.warn('Failed to mark announcement as read:', error);
    }
    
    // Call onOpen if provided (for backward compatibility)
    if (onOpen) {
      onOpen(announcement);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-300 bg-white';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'medium':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'low':
        return <Calendar className="w-5 h-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'all':
        return 'Everyone';
      case 'tenants':
        return 'Tenants';
      case 'staff':
        return 'Staff';
      case 'admins':
        return 'Admins';
      case 'custom':
        return 'Custom';
      default:
        return audience;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysAgo = (dateString: string) => {
    const now = new Date();
    const publishDate = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - publishDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const isScheduled = new Date(announcement.publishDate) > new Date();

  return (
    <div
      onClick={handleClick}
      className={`
        relative border border-l-4 rounded-lg cursor-pointer transition-all duration-200
        ${getPriorityColor(announcement.priority)}
        ${selected ? 'ring-2 ring-blue-300 shadow-md' : 'hover:shadow-md'}
        shadow-sm
        ${compact ? 'p-3' : 'p-5'}
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      {/* Status indicators */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority */}
          <div className="flex items-center gap-1">
            {getPriorityIcon(announcement.priority)}
            <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${getPriorityLabel(announcement.priority)}`}>
              {announcement.priority.toUpperCase()}
            </span>
          </div>

          {/* Audience */}
          <span className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-700">
            {getAudienceLabel(announcement.audience)}
          </span>

          {/* Status indicators */}
          {isScheduled && (
            <span className="text-sm px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-800">
              Scheduled
            </span>
          )}
          {announcement.isArchived && (
            <span className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
              Archived
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className={`font-semibold text-gray-900 mb-3 ${compact ? 'text-sm' : 'text-xl'}`}>
        {announcement.title}
      </h3>

      {/* Content preview */}
      <p className={`text-gray-600 mb-4 ${compact ? 'text-xs' : 'text-base'} line-clamp-2`}>
        {announcement.content.length > 150 
          ? `${announcement.content.substring(0, 150)}...` 
          : announcement.content
        }
      </p>

      {/* Attachments indicator */}
      {announcement.attachments && announcement.attachments.length > 0 && (
        <div className="flex items-center gap-1 mb-4">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span className="text-xs text-gray-500">
            {announcement.attachments.length} attachment{announcement.attachments.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-4">
          {/* Author */}
          {showAuthor && announcement.author && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{announcement.author.name}</span>
            </div>
          )}

          {/* Publish date */}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{getDaysAgo(announcement.publishDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard;