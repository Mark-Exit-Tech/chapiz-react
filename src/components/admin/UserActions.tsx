'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { getUserFromFirestore } from '@/lib/supabase/database/users';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { deleteUser, updateUserRole, restrictUser, unrestrictUser, addPointsToUser } from '@/lib/actions/admin';
import { updateUserByUid } from '@/lib/supabase/database/users';
import { MoreHorizontal, Phone, PawPrint, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function UserActions({
  userId,
  currentRole,
  isSuperAdmin,
  isRestricted,
  phoneNumber,
  userAddress
}: {
  userId: string;
  currentRole: string;
  isSuperAdmin: boolean;
  isRestricted?: boolean;
  phoneNumber?: string;
  userAddress?: string;
}) {
  const { t } = useTranslation('Admin');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newRole, setNewRole] = useState(currentRole);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [restrictionReason, setRestrictionReason] = useState('');
  const [showRestrictionReasonInput, setShowRestrictionReasonInput] = useState(false);
  const [phone, setPhone] = useState(phoneNumber || '');
  const [currentAddress, setCurrentAddress] = useState(userAddress || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddPointsOpen, setIsAddPointsOpen] = useState(false);
  const [pointsAmount, setPointsAmount] = useState('100');
  const [pointsDescription, setPointsDescription] = useState('');
  const [isAddingPoints, setIsAddingPoints] = useState(false);

  const navigate = useNavigate();

  const handleRoleChange = async () => {
    if (newRole === currentRole) {
      setIsEditOpen(false);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateUserRole(userId, newRole as 'user' | 'admin' | 'super_admin');
      setIsEditOpen(false);
      window.location.reload();
    } catch (err) {
      setError(t('userActions.updateRoleError'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  // ... (skipping unchanged lines)
  // ...
  const handleRestrictionToggle = async (checked: boolean) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (checked) {
        await unrestrictUser(userId);
      } else {
        await restrictUser(userId, '');
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('userActions.updateRestrictionError'));
    } finally {
      setIsSubmitting(false);
    }
  };
  // ...
  // ...
  <div className="space-y-2">
    <Label>{t('userActions.accountStatus')}</Label>
    <div className="flex items-center space-x-2">
      <Checkbox
        checked={!isRestricted}
        onCheckedChange={(checked) => {
          handleRestrictionToggle(checked === true);
        }}
      />
      <span>{isRestricted ? t('userActions.restricted') : t('userActions.active')}</span>
    </div>
  </div>
              </>
            )
}

          </div >

  <DialogFooter className="flex space-x-2">
    <Button variant="outline" onClick={() => setIsEditOpen(false)}>
      {t('userActions.cancel')}
    </Button>
    <Button onClick={handleSaveChanges} disabled={isSubmitting || isLoading}>
      {isSubmitting ? t('userActions.savingChanges') : t('userActions.saveChanges')}
    </Button>
  </DialogFooter>
        </DialogContent >
      </Dialog >

  {/* Delete Confirmation Dialog - completely separate from dropdown */ }
  < Dialog
open = { isDeleting }
onOpenChange = {(open) => {
  if (!open) {
    setDeleteConfirmation(false);
    setError(null);
  }
  setIsDeleting(open);
}}
      >
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>{t('userActions.confirmDeletion')}</DialogTitle>
      <DialogDescription>
        {t('userActions.deleteUserMessage')}
      </DialogDescription>
    </DialogHeader>

    <DialogFooter>
      <Button variant="outline" onClick={() => setIsDeleting(false)}>
        {t('userActions.cancel')}
      </Button>
      <Button
        variant="destructive"
        onClick={() => {
          setDeleteConfirmation(true);
          handleDelete();
        }}
      >
        {t('userActions.deleteUser')}
      </Button>
    </DialogFooter>
  </DialogContent>
      </Dialog >

  {/* Add Points Dialog */ }
  < Dialog
open = { isAddPointsOpen }
onOpenChange = {(open) => {
  if (!open) {
    setPointsAmount('100');
    setPointsDescription('');
    setError(null);
  }
  setIsAddPointsOpen(open);
}}
      >
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>{t('userActions.addPoints')}</DialogTitle>
      <DialogDescription>
        {t('userActions.addPointsDescription')}
      </DialogDescription>
    </DialogHeader>

    {error && (
      <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
        {error}
      </div>
    )}

    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label>{t('userActions.pointsAmount')}</Label>
        <Input
          type="number"
          min="1"
          value={pointsAmount}
          onChange={(e) => setPointsAmount(e.target.value)}
          placeholder="100"
        />
      </div>

      <div className="space-y-2">
        <Label>{t('userActions.description')} ({t('userActions.optional')})</Label>
        <Textarea
          value={pointsDescription}
          onChange={(e) => setPointsDescription(e.target.value)}
          placeholder={t('userActions.pointsDescriptionPlaceholder')}
          rows={3}
        />
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setIsAddPointsOpen(false)}>
        {t('userActions.cancel')}
      </Button>
      <Button onClick={handleAddPoints} disabled={isAddingPoints}>
        {isAddingPoints ? t('userActions.addingPoints') : t('userActions.addPoints')}
      </Button>
    </DialogFooter>
  </DialogContent>
      </Dialog >

    </div >
  );
}
