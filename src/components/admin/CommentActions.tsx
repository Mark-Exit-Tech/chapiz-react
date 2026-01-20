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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { deleteComment } from '@/lib/actions/admin';
import { MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function CommentActions({
  commentId,
  content
}: {
  commentId: string;
  content: string;
}) {
  const { t } = useTranslation('Admin');

  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await deleteComment(commentId);

      if (!result.success) {
        setError(result.error || 'Failed to delete comment');
      } else {
        setIsDeleting(false);
        window.location.reload();
      }
    } catch (err) {
      setError('Failed to delete comment');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <>
      {/* Actions select with native menu */}
      <select
        className="h-8 w-8 p-0 border-0 bg-transparent cursor-pointer appearance-none text-center"
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'delete') setIsDeleting(true);
          e.target.value = '';
        }}
        value=""
        title={t('commentActions.actions')}
      >
        <option value="" disabled>⋮</option>
        <option value="delete">{t('commentActions.delete')}</option>
      </select>

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
            <DialogTitle>{t('commentActions.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('commentActions.deleteMessage')}
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 p-3 bg-gray-50 rounded border">
            <p className="text-sm text-gray-700">
              <strong>{t('commentActions.comment')}</strong> {content}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              {t('commentActions.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('commentActions.deleting') : t('commentActions.deleteCommentButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
