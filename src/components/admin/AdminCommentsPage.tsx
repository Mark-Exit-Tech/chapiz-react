'use client';

import { useState, useEffect } from 'react';
import { getAllComments, deleteComment, type Comment } from '@/lib/firebase/database/comments';
import { Trash2, MessageSquare } from 'lucide-react';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    title: isHebrew ? 'ניהול תגובות' : 'Comments Management',
    description: isHebrew ? 'נהלו וערכו את כל התגובות בפלטפורמה' : 'Manage and moderate all comments on the platform',
    noComments: isHebrew ? 'אין תגובות' : 'No comments yet',
    loading: isHebrew ? 'טוען...' : 'Loading...',
    delete: isHebrew ? 'מחק' : 'Delete',
    deleteSuccess: isHebrew ? 'התגובה נמחקה בהצלחה' : 'Comment deleted successfully',
    deleteFailed: isHebrew ? 'נכשל במחיקת התגובה' : 'Failed to delete comment',
    user: isHebrew ? 'משתמש' : 'User',
    content: isHebrew ? 'תוכן' : 'Content',
    date: isHebrew ? 'תאריך' : 'Date',
    adId: isHebrew ? 'מזהה מודעה' : 'Ad ID',
    rating: isHebrew ? 'דירוג' : 'Rating',
    actions: isHebrew ? 'פעולות' : 'Actions'
  };

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await getAllComments();
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isHebrew ? 'האם אתה בטוח שברצונך למחוק תגובה זו?' : 'Are you sure you want to delete this comment?')) {
      return;
    }

    const success = await deleteComment(id);
    if (success) {
      alert(text.deleteSuccess);
      setComments(comments.filter(c => c.id !== id));
    } else {
      alert(text.deleteFailed);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">{text.loading}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="space-y-6">
        <div className="text-left rtl:text-right">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-8 h-8" />
            {text.title}
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            {text.description}
          </p>
        </div>

        {comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">{text.noComments}</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {text.user}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {text.content}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {text.rating}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {text.date}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {text.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comments.map((comment) => (
                    <tr key={comment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {comment.userImage ? (
                            <img 
                              src={comment.userImage} 
                              alt={comment.userName || text.user}
                              className="w-8 h-8 rounded-full mr-2"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 mr-2" />
                          )}
                          <span className="text-sm text-gray-900">{comment.userName || text.user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md truncate">
                          {comment.content}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {comment.rating && (
                          <span className="text-sm text-gray-900">⭐ {comment.rating}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(() => {
                          try {
                            const date = comment.createdAt;
                            // Handle Firestore Timestamp
                            if (date && typeof date === 'object' && 'toDate' in date) {
                              return (date as any).toDate().toLocaleDateString(isHebrew ? 'he-IL' : 'en-US');
                            }
                            // Handle Date object
                            if (date instanceof Date) {
                              return date.toLocaleDateString(isHebrew ? 'he-IL' : 'en-US');
                            }
                            // Handle string date
                            if (typeof date === 'string') {
                              return new Date(date).toLocaleDateString(isHebrew ? 'he-IL' : 'en-US');
                            }
                            return '-';
                          } catch (e) {
                            return '-';
                          }
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
