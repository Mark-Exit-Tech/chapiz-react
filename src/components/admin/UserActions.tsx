'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { getUserFromFirestore } from '@/lib/firebase/database/users';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { deleteUser, updateUserRole, restrictUser, unrestrictUser, addPointsToUser } from '@/lib/actions/admin';
import { updateUserByUid } from '@/lib/firebase/database/users';
import { Phone, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';

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
  const locale = useLocale();
  const isRTL = locale === 'he';
  const isHebrew = locale === 'he';

  // Hardcoded text - NO TRANSLATION KEYS!
  const text = {
    // Dropdown menu items
    actions: isHebrew ? 'פעולות' : 'Actions',
    viewPets: isHebrew ? 'צפה בחיות מחמד' : 'View Pets',
    editUser: isHebrew ? 'ערוך משתמש' : 'Edit User',
    deleteUser: isHebrew ? 'מחק משתמש' : 'Delete User',
    addPoints: isHebrew ? 'הוסף נקודות' : 'Add Points',
    // Edit dialog
    editUserDescription: isHebrew ? 'נהל תפקיד משתמש, הגבלות ופרטי קשר' : 'Manage user role, restrictions, and contact information',
    userRole: isHebrew ? 'תפקיד משתמש' : 'User Role',
    selectRole: isHebrew ? 'בחר תפקיד' : 'Select a role',
    phoneNumber: isHebrew ? 'מספר טלפון' : 'Phone Number',
    enterPhone: isHebrew ? 'הזן מספר טלפון' : 'Enter phone number',
    address: isHebrew ? 'כתובת' : 'Address',
    enterAddress: isHebrew ? 'הזן כתובת' : 'Enter address',
    accountStatus: isHebrew ? 'סטטוס חשבון' : 'Account Status',
    active: isHebrew ? 'פעיל' : 'Active',
    restricted: isHebrew ? 'מוגבל' : 'Restricted',
    cancel: isHebrew ? 'ביטול' : 'Cancel',
    saveChanges: isHebrew ? 'שמור שינויים' : 'Save Changes',
    savingChanges: isHebrew ? 'שומר שינויים...' : 'Saving Changes...',
    // Delete dialog
    confirmDeletion: isHebrew ? 'אישור מחיקה' : 'Confirm Deletion',
    deleteUserMessage: isHebrew ? 'האם אתה בטוח שברצונך למחוק את המשתמש הזה? פעולה זו לא ניתנת לביטול.' : 'Are you sure you want to delete this user? This action cannot be undone.',
    deletingUser: isHebrew ? 'מוחק משתמש...' : 'Deleting User...',
    // Add points dialog
    addPointsDescription: isHebrew ? 'הוסף נקודות לחשבון המשתמש הזה. פעולה זו תירשם בהיסטוריית העסקאות.' : 'Add points to this user\'s account. This action will be logged in the transaction history.',
    pointsAmount: isHebrew ? 'כמות נקודות' : 'Points Amount',
    description: isHebrew ? 'תיאור' : 'Description',
    optional: isHebrew ? 'אופציונלי' : 'Optional',
    pointsDescriptionPlaceholder: isHebrew ? 'למשל, תגמול על הפניה, נקודות בונוס וכו\'.' : 'e.g., Reward for referral, Bonus points, etc.',
    addingPoints: isHebrew ? 'מוסיף נקודות...' : 'Adding Points...',
    roles: {
      user: isHebrew ? 'משתמש' : 'User',
      admin: isHebrew ? 'מנהל' : 'Admin',
      superAdmin: isHebrew ? 'מנהל על' : 'Super Admin',
    }
  };

  // Helper function to get translated role name
  const getRoleName = (role: string): string => {
    if (role === 'user') return text.roles.user;
    if (role === 'admin') return text.roles.admin;
    if (role === 'super_admin') return text.roles.superAdmin;
    return text.selectRole;
  };
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newRole, setNewRole] = useState(currentRole);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [restrictionReason, setRestrictionReason] = useState('');
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

  const handleDeleteClick = () => {
    setIsDeleting(true);
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await deleteUser(userId);

      if (!result.success) {
        setError(result.error || t('userActions.deleteUserError'));
      } else {
        setIsDeleting(false);
        window.location.reload();
      }
    } catch (err) {
      setError(t('userActions.deleteUserError'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestrictUser = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await restrictUser(userId, restrictionReason);
      if (result.success) {
        setRestrictionReason('');
        window.location.reload();
      } else {
        setError(result.error || t('userActions.restrictUserError'));
      }
    } catch (err) {
      setError(t('userActions.restrictUserError'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnrestrictUser = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await unrestrictUser(userId);
      if (result.success) {
        window.location.reload();
      } else {
        setError(result.error || t('userActions.unrestrictUserError'));
      }
    } catch (err) {
      setError(t('userActions.unrestrictUserError'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Update role if changed
      if (newRole !== currentRole) {
        await updateUserRole(userId, newRole as 'user' | 'admin' | 'super_admin');
      }

      // Update phone and address if changed
      if (phone !== phoneNumber || currentAddress !== userAddress) {
        const result = await updateUserByUid(userId, {
          ...(phone !== phoneNumber ? { phone } : {}),
          ...(currentAddress !== userAddress ? { address: currentAddress } : {})
        });
        if (!result.success) {
          throw new Error(result.error || t('userActions.updateUserInfoError'));
        }
      }

      setIsEditOpen(false);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('userActions.saveChangesError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPoints = async () => {
    const points = parseInt(pointsAmount);

    if (isNaN(points) || points <= 0) {
      setError(t('userActions.invalidPointsAmount'));
      return;
    }

    setIsAddingPoints(true);
    setError(null);

    try {
      const result = await addPointsToUser(
        userId,
        points,
        pointsDescription || undefined
      );

      if (result.success) {
        setIsAddPointsOpen(false);
        setPointsAmount('100');
        setPointsDescription('');
        window.location.reload();
      } else {
        setError(result.error || t('userActions.addPointsError'));
      }
    } catch (err) {
      setError(t('userActions.addPointsError'));
      console.error(err);
    } finally {
      setIsAddingPoints(false);
    }
  };

  // Handle opening the edit dialog
  const handleOpenEditDialog = async () => {
    setIsLoading(true);

    try {
      const userResult = await getUserFromFirestore(userId);
      if (userResult.success && userResult.user) {
        setPhone(userResult.user.phone || '');
        setCurrentAddress(userResult.user.address || '');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
      setIsEditOpen(true);
    }
  };

  return (
    <>
      {/* Actions select with native menu */}
      <select
        className="h-8 px-2 border rounded bg-white cursor-pointer text-sm"
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'edit') handleOpenEditDialog();
          if (value === 'points') setIsAddPointsOpen(true);
          if (value === 'delete') handleDeleteClick();
          e.target.value = '';
        }}
        value=""
        title={text.actions}
      >
        <option value="" disabled>⋮ {text.actions}</option>
        <option value="edit">{text.editUser}</option>
        <option value="points">{text.addPoints}</option>
        {!isSuperAdmin && <option value="delete">{text.deleteUser}</option>}
      </select>

      {/* Edit Role Dialog - completely separate from dropdown */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            setNewRole(currentRole);
            setError(null);
          }
          setIsEditOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{text.editUser}</DialogTitle>
            <DialogDescription>{text.editUserDescription}</DialogDescription>
          </DialogHeader>

          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <>
                {/* Role Selection */}
                <div className="space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
                  <Label>{text.userRole}</Label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">{text.selectRole}</option>
                    <option value="user">{text.roles.user}</option>
                    <option value="admin">{text.roles.admin}</option>
                    <option value="super_admin">{text.roles.superAdmin}</option>
                  </select>
                </div>

                {/* Phone Number */}
                <div className="space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
                  <Label>{text.phoneNumber}</Label>
                  <div className="relative">
                    <Phone className={cn("absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4", isRTL ? "right-3" : "left-3")} />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={text.enterPhone}
                      className={isRTL ? "pr-10 text-right" : "pl-10"}
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
                  <Label>{text.address}</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={currentAddress}
                      onChange={(e) => setCurrentAddress(e.target.value)}
                      placeholder={text.enterAddress}
                      className={isRTL ? "text-right" : ""}
                    />
                  </div>
                </div>

                {/* User Status */}
                <div className="space-y-2">
                  <Label>{text.accountStatus}</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={!isRestricted}
                      onCheckedChange={(checked) => {
                        handleRestrictionToggle(checked === true);
                      }}
                    />
                    <span>{isRestricted ? text.restricted : text.active}</span>
                  </div>
                </div>
              </>
            )}

          </div>

          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              {text.cancel}
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSubmitting || isLoading}>
              {isSubmitting ? text.savingChanges : text.saveChanges}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog - completely separate from dropdown */}
      <Dialog
        open={isDeleting}
        onOpenChange={(open) => {
          if (!open) {
            setError(null);
          }
          setIsDeleting(open);
        }}
      >
        <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{text.confirmDeletion}</DialogTitle>
            <DialogDescription>
              {text.deleteUserMessage}
            </DialogDescription>
          </DialogHeader>

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
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? text.deletingUser : text.deleteUser}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Points Dialog */}
      <Dialog
        open={isAddPointsOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPointsAmount('100');
            setPointsDescription('');
            setError(null);
          }
          setIsAddPointsOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{text.addPoints}</DialogTitle>
            <DialogDescription>
              {text.addPointsDescription}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{text.pointsAmount}</Label>
              <Input
                type="number"
                min="1"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
                placeholder="100"
                className={isRTL ? "text-right" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label>{text.description} ({text.optional})</Label>
              <Textarea
                value={pointsDescription}
                onChange={(e) => setPointsDescription(e.target.value)}
                placeholder={text.pointsDescriptionPlaceholder}
                rows={3}
                className={isRTL ? "text-right" : ""}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPointsOpen(false)}>
              {text.cancel}
            </Button>
            <Button onClick={handleAddPoints} disabled={isAddingPoints}>
              {isAddingPoints ? text.addingPoints : text.addPoints}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}
