'use client';

import { useState, useEffect } from 'react';
import { getAllContactSubmissions, type ContactSubmission } from '@/lib/firebase/database/contact';
import { Mail, Phone, User, Calendar, Eye, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    title: isHebrew ? 'פניות יצירת קשר' : 'Contact Submissions',
    description: isHebrew ? 'צפו ונהלו את כל פניות יצירת הקשר' : 'View and manage all contact form submissions',
    loading: isHebrew ? 'טוען...' : 'Loading...',
    noSubmissions: isHebrew ? 'אין פניות' : 'No submissions yet',
    name: isHebrew ? 'שם' : 'Name',
    email: isHebrew ? 'אימייל' : 'Email',
    phone: isHebrew ? 'טלפון' : 'Phone',
    message: isHebrew ? 'הודעה' : 'Message',
    date: isHebrew ? 'תאריך' : 'Date',
    status: isHebrew ? 'סטטוס' : 'Status',
    actions: isHebrew ? 'פעולות' : 'Actions',
    read: isHebrew ? 'נקרא' : 'Read',
    unread: isHebrew ? 'לא נקרא' : 'Unread',
    view: isHebrew ? 'צפה' : 'View',
    totalSubmissions: isHebrew ? 'סה"כ פניות' : 'Total Submissions',
    unreadCount: isHebrew ? 'לא נקראו' : 'Unread',
    viewDetails: isHebrew ? 'פרטי הפנייה' : 'Submission Details',
    close: isHebrew ? 'סגור' : 'Close'
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await getAllContactSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = submissions.filter(s => !s.read).length;

  const formatDate = (date: Date) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return isNaN(dateObj.getTime()) 
        ? '-' 
        : dateObj.toLocaleDateString(isHebrew ? 'he-IL' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-gray-600">{text.loading}</div>
          </div>
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
          <div className="mt-4 flex gap-2">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {text.totalSubmissions}: {submissions.length}
            </Badge>
            {unreadCount > 0 && (
              <Badge className="bg-red-100 text-red-800 text-lg px-4 py-2">
                {text.unreadCount}: {unreadCount}
              </Badge>
            )}
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">{text.noSubmissions}</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{text.name}</TableHead>
                    <TableHead>{text.email}</TableHead>
                    <TableHead>{text.phone}</TableHead>
                    <TableHead>{text.message}</TableHead>
                    <TableHead>{text.date}</TableHead>
                    <TableHead>{text.status}</TableHead>
                    <TableHead className="w-[100px]">{text.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id} className={!submission.read ? 'bg-blue-50' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {submission.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a 
                          href={`mailto:${submission.email}`}
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <Mail className="w-4 h-4" />
                          {submission.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        {submission.phone ? (
                          <a 
                            href={`tel:${submission.phone}`}
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <Phone className="w-4 h-4" />
                            {submission.phone}
                          </a>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {submission.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(submission.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={submission.read ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}>
                          {submission.read ? text.read : text.unread}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          {text.view}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{text.viewDetails}</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">{text.name}</label>
                <p className="text-gray-900">{selectedSubmission.name}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">{text.email}</label>
                <p className="text-blue-600">
                  <a href={`mailto:${selectedSubmission.email}`}>{selectedSubmission.email}</a>
                </p>
              </div>
              {selectedSubmission.phone && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">{text.phone}</label>
                  <p className="text-blue-600">
                    <a href={`tel:${selectedSubmission.phone}`}>{selectedSubmission.phone}</a>
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-gray-700">{text.date}</label>
                <p className="text-gray-900">{formatDate(selectedSubmission.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">{text.message}</label>
                <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                  {selectedSubmission.message}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
