import React, { useEffect } from 'react';
import { X, Calendar, User, AlertCircle, Download } from 'lucide-react';
import { Announcement } from '../../types/announcement';
import { announcementService } from '../../services/announcementService';

interface AnnouncementDetailModalProps {
  announcement: Announcement | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (announcement: Announcement) => void;
  userRole?: 'admin' | 'staff' | 'tenant';
}

const AnnouncementDetailModal: React.FC<AnnouncementDetailModalProps> = ({
  announcement,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  userRole = 'tenant'
}) => {
  // Mark announcement as read when modal opens
  useEffect(() => {
    if (isOpen && announcement && !announcement.isRead) {
      announcementService.markAsRead(announcement._id || announcement.id).catch(error => {
        console.warn('Failed to mark announcement as read:', error);
      });
    }
  }, [isOpen, announcement]);

  if (!isOpen || !announcement) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4" />;
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
        return <Calendar className="w-4 h-4" />;
      case 'low':
        return <Calendar className="w-4 h-4" />;
      default:
        return null;
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const isScheduled = new Date(announcement.publishDate) > new Date();
  const canEdit = userRole === 'admin';
  const canDelete = userRole === 'admin';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1 pr-4">
            {/* Title and badges */}
            <div className="flex items-start gap-3 mb-3">
              <h2 className="text-xl font-semibold text-gray-900 flex-1">{announcement.title}</h2>
            </div>

            {/* Status badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Priority */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(announcement.priority)}`}>
                {getPriorityIcon(announcement.priority)}
                <span>{announcement.priority.toUpperCase()}</span>
              </div>

              {/* Audience */}
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                {getAudienceLabel(announcement.audience)}
              </span>

              {/* Status indicators */}
              {isScheduled && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                  Scheduled
                </span>
              )}
              {announcement.isArchived && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  Archived
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Announcement content */}
          <div className="prose max-w-none mb-6">
            <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {announcement.content}
            </div>
          </div>

          {/* Attachments */}
          {announcement.attachments && announcement.attachments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Attachments</h3>
              <div className="space-y-2">
                {announcement.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                        {attachment.size && (
                          <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(attachment.url, '_blank')}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
            {/* Author */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Published by:</span>
              <span className="font-medium text-gray-900">
                {announcement.author.name} ({announcement.author.role})
              </span>
            </div>

            {/* Publish date */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Published:</span>
              <span className="font-medium text-gray-900">
                {formatDate(announcement.publishDate)}
              </span>
            </div>

            {/* Created/Updated */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Created:</span>
              <span className="font-medium text-gray-900">
                {formatDate(announcement.createdAt)}
              </span>
            </div>

            {announcement.updatedAt !== announcement.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Updated:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(announcement.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {(canEdit || canDelete) && (
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(announcement)}
                className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Edit
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(announcement)}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementDetailModal;