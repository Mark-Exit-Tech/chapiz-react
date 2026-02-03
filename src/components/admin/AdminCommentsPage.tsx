'use client';

import { useState, useEffect } from 'react';
import { getAllComments, deleteComment, type Comment } from '@/lib/firebase/database/comments';
import { Trash2, MessageSquare, User } from 'lucide-react';
import AdminLayout from './AdminLayout';

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
    logo: isHebrew ? 'לוגו' : 'Logo',
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
      <AdminLayout>
        <div className="container mx-auto p-4 md:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">{text.loading}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 md:p-8" dir={isHebrew ? 'rtl' : 'ltr'}>
        <div className="space-y-6">
        <div className={isHebrew ? 'text-right' : 'text-left'}>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-8 h-8 shrink-0" />
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
            <div
              className="overflow-x-auto"
              dir={isHebrew ? 'rtl' : 'ltr'}
              style={isHebrew ? { direction: 'rtl' } : undefined}
            >
              <table
                className="min-w-full divide-y divide-gray-200 table-fixed"
                dir={isHebrew ? 'rtl' : 'ltr'}
                style={isHebrew ? { direction: 'rtl' } : undefined}
              >
                <thead className="bg-gray-50">
                  <tr>
                    {isHebrew ? (
                      <>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                          {text.actions}
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                          {text.date}
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                          {text.rating}
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                          {text.content}
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                          {text.user}
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right w-16">
                          {text.logo}
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left w-16">
                          {text.logo}
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                          {text.user}
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                          {text.content}
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                          {text.rating}
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                          {text.date}
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                          {text.actions}
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comments.map((comment) => (
                    <tr key={comment.id}>
                      {isHebrew ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                            <button
                              onClick={() => handleDelete(comment.id)}
                              className="text-red-600 hover:text-red-900 inline-flex"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {(() => {
                              try {
                                const date = comment.createdAt;
                                if (date && typeof date === 'object' && 'toDate' in date) {
                                  return (date as any).toDate().toLocaleDateString('he-IL');
                                }
                                if (date instanceof Date) {
                                  return date.toLocaleDateString('he-IL');
                                }
                                if (typeof date === 'string') {
                                  return new Date(date).toLocaleDateString('he-IL');
                                }
                                return '-';
                              } catch (e) {
                                return '-';
                              }
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {comment.rating && (
                              <span className="text-sm text-gray-900">⭐ {comment.rating}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-sm text-gray-900 max-w-md truncate">
                              {comment.content}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm text-gray-900">{comment.userName || text.user}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right w-16">
                            {comment.userImage ? (
                              <img
                                src={comment.userImage}
                                alt={comment.userName || text.user}
                                className="w-8 h-8 rounded-full object-cover mx-auto block"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                                <User className="w-5 h-5 text-gray-500" />
                              </div>
                            )}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap w-16">
                            {comment.userImage ? (
                              <img
                                src={comment.userImage}
                                alt={comment.userName || text.user}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-500" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{comment.userName || text.user}</span>
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
                                if (date && typeof date === 'object' && 'toDate' in date) {
                                  return (date as any).toDate().toLocaleDateString('en-US');
                                }
                                if (date instanceof Date) {
                                  return date.toLocaleDateString('en-US');
                                }
                                if (typeof date === 'string') {
                                  return new Date(date).toLocaleDateString('en-US');
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
                              className="text-red-600 hover:text-red-900 inline-flex"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </div>
    </AdminLayout>
  );
}
