'use client';

import { useTranslation } from 'react-i18next';
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
import { deletePet } from '@/lib/actions/admin';
import { updatePetInFirestore } from '@/lib/firebase/database/pets';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

export default function PetActions({
  petId,
  petName,
  isLost = false,
  onLostChange
}: {
  petId: string;
  petName: string;
  isLost?: boolean;
  onLostChange?: (petId: string, isLost: boolean) => void;
}) {
  const { t } = useTranslation('Admin.petActions');

  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingLost, setIsUpdatingLost] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await deletePet(petId);

      if (!result.success) {
        setError(result.error || 'Failed to delete pet');
      } else {
        setIsDeleting(false);
        window.location.reload();
      }
    } catch (err) {
      setError('Failed to delete pet');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLost = async () => {
    setIsUpdatingLost(true);
    setError(null);

    try {
      const nextIsLost = !isLost;
      const result = await updatePetInFirestore(petId, { isLost: nextIsLost });

      if (!result.success) {
        setError(result.error || 'Failed to update lost status');
        return;
      }

      onLostChange?.(petId, nextIsLost);
    } catch (err) {
      setError('Failed to update lost status');
      console.error(err);
    } finally {
      setIsUpdatingLost(false);
    }
  };

  return (
    <>
      {/* Actions select with native menu */}
      <select
        className="h-8 w-8 p-0 border-0 bg-transparent cursor-pointer appearance-none text-center"
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'view') window.open(`/${locale}/pet/${petId}`, '_blank');
          if (value === 'edit') window.location.assign(`/${locale}/pet/${petId}/edit`);
          if (value === 'lost') handleToggleLost();
          if (value === 'delete') setIsDeleting(true);
          e.target.value = '';
        }}
        value=""
        title={t('actions')}
      >
        <option value="" disabled>⋮</option>
        <option value="view">{t('view')}</option>
        <option value="edit">{isHebrew ? 'ערוך' : 'Edit'}</option>
        <option value="lost" disabled={isUpdatingLost}>
          {isLost ? (isHebrew ? 'סמן כנמצא' : 'Mark found') : (isHebrew ? 'סמן כאבוד' : 'Mark lost')}
        </option>
        <option value="delete">{t('delete')}</option>
      </select>

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
            <DialogTitle>{t('delete')}</DialogTitle>
            <DialogDescription>
              {t('confirmDelete')} "{petName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('deleting') : t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
