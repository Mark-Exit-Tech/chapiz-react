'use client';


import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { deleteContactSubmission, updateContactSubmissionReadStatus } from '@/lib/actions/admin';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { type ContactSubmission } from '@/lib/actions/admin';

export default function ContactSubmissionActions({
  submissionId,
  isRead,
  submission
}: {
  submissionId: string;
  isRead: boolean;
  submission: ContactSubmission;
}) {
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';

  // Hardcoded text - NO TRANSLATION KEYS!
  const text = {
    actions: isHebrew ? 'פעולות' : 'Actions',
    viewDetails: isHebrew ? 'צפה בפרטים' : 'View Details',
    markAsRead: isHebrew ? 'סמן כנקרא' : 'Mark as Read',
    markAsUnread: isHebrew ? 'סמן כלא נקרא' : 'Mark as Unread',
    deleteSubmission: isHebrew ? 'מחק פנייה' : 'Delete Submission',
    viewDialogTitle: isHebrew ? 'פרטי פנייה' : 'Contact Submission Details',
    viewDialogDescription: isHebrew ? 'פרטים מלאים של פנייה מטופס הקשר' : 'Full details of the contact form submission',
    name: isHebrew ? 'שם' : 'Name',
    email: isHebrew ? 'אימייל' : 'Email',
    phone: isHebrew ? 'טלפון' : 'Phone',
    message: isHebrew ? 'הודעה' : 'Message',
    submitted: isHebrew ? 'נשלח' : 'Submitted',
    status: isHebrew ? 'סטטוס' : 'Status',
    close: isHebrew ? 'סגור' : 'Close',
    read: isHebrew ? 'נקרא' : 'Read',
    unread: isHebrew ? 'לא נקרא' : 'Unread',
    deleteDialogTitle: isHebrew ? 'מחק פנייה' : 'Delete Contact Submission',
    deleteDialogDescription: isHebrew ? 'האם אתה בטוח שברצונך למחוק פנייה זו? פעולה זו לא ניתנת לביטול.' : 'Are you sure you want to delete this contact submission? This action cannot be undone.',
    from: isHebrew ? 'מאת:' : 'From:',
    cancel: isHebrew ? 'ביטול' : 'Cancel',
    deleting: isHebrew ? 'מוחק...' : 'Deleting...',
    deleteFailed: isHebrew ? 'נכשל במחיקת הפנייה' : 'Failed to delete submission',
    updateStatusFailed: isHebrew ? 'נכשל בעדכון הסטטוס' : 'Failed to update read status'
  };

  const [isViewing, setIsViewing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await deleteContactSubmission(submissionId);

      if (!result.success) {
        setError(result.error || text.deleteFailed);
      } else {
        setIsDeleting(false);
        window.location.reload();
      }
    } catch (err) {
      setError(text.deleteFailed);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReadStatusChange = async (read: boolean) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateContactSubmissionReadStatus(submissionId, read);

      if (!result.success) {
        setError(result.error || text.updateStatusFailed);
      } else {
        window.location.reload();
      }
    } catch (err) {
      setError(text.updateStatusFailed);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Actions select with native menu */}
      <select
        className="h-8 px-2 border rounded bg-white cursor-pointer text-sm"
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'view') setIsViewing(true);
          if (value === 'read') handleReadStatusChange(true);
          if (value === 'unread') handleReadStatusChange(false);
          if (value === 'delete') setIsDeleting(true);
          e.target.value = '';
        }}
        value=""
        title={text.actions}
      >
        <option value="" disabled>⋮ {text.actions}</option>
        <option value="view">{text.viewDetails}</option>
        {!isRead ? (
          <option value="read">{text.markAsRead}</option>
        ) : (
          <option value="unread">{text.markAsUnread}</option>
        )}
        <option value="delete">{text.deleteSubmission}</option>
      </select>

      {/* View Details Dialog */}
      <Dialog
        open={isViewing}
        onOpenChange={(open) => {
          if (!open) {
            setError(null);
          }
          setIsViewing(open);
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir={isHebrew ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {text.viewDialogTitle}
            </DialogTitle>
            <DialogDescription>
              {text.viewDialogDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">{text.name}</label>
                <p className="text-sm text-gray-900">{submission.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{text.email}</label>
                <p className="text-sm text-gray-900">{submission.email}</p>
              </div>
            </div>

            {submission.phone && (
              <div>
                <label className="text-sm font-medium text-gray-700">{text.phone}</label>
                <p className="text-sm text-gray-900">{submission.phone}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">{text.message}</label>
              <div className="mt-1 p-3 bg-gray-50 rounded border text-sm text-gray-900 whitespace-pre-wrap">
                {submission.message}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">{text.submitted}</label>
                <p className="text-sm text-gray-900">
                  {new Date(submission.createdAt).toLocaleString('en-GB')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{text.status}</label>
                <p className="text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${submission.isRead
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                      }`}
                  >
                    {submission.isRead ? text.read : text.unread}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewing(false)}>
              {text.close}
            </Button>
            {!isRead && (
              <Button onClick={() => handleReadStatusChange(true)}>
                {text.markAsRead}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleting}
        onOpenChange={(open) => {
          if (!open) {
            setError(null);
          }
          setIsDeleting(open);
        }}
      >
        <DialogContent className="sm:max-w-md" dir={isHebrew ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{text.deleteDialogTitle}</DialogTitle>
            <DialogDescription>
              {text.deleteDialogDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 p-3 bg-gray-50 rounded border">
            <p className="text-sm text-gray-700">
              <strong>{text.from}</strong> {submission.name} ({submission.email})
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              {text.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? text.deleting : text.deleteSubmission}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
