'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/FirebaseAuthContext';

// TODO: Implement with Firebase
const sendUserInvitationByAdmin = async (data: any): Promise<{ success: boolean; error?: string; warning?: string }> => {
  console.warn('sendUserInvitationByAdmin not yet implemented with Firebase');
  return { success: true, warning: 'Function not yet implemented with Firebase' };
};

export default function AddUserForm() {
  const { t } = useTranslation('Admin');
  const { user, dbUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'user' as 'user' | 'admin' | 'super_admin',
    language: 'he' as 'en' | 'he'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useNavigate();
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    addUser: isHebrew ? 'הוסף משתמש' : 'Add User',
    title: isHebrew ? 'הוסף משתמש חדש' : 'Add New User',
    fullName: isHebrew ? 'שם מלא' : 'Full Name',
    email: isHebrew ? 'אימייל' : 'Email',
    phone: isHebrew ? 'טלפון' : 'Phone',
    role: isHebrew ? 'תפקיד' : 'Role',
    selectRole: isHebrew ? 'בחר תפקיד' : 'Select Role',
    user: isHebrew ? 'משתמש' : 'User',
    admin: isHebrew ? 'מנהל' : 'Admin',
    superAdmin: isHebrew ? 'מנהל על' : 'Super Admin',
    language: isHebrew ? 'שפה' : 'Language',
    selectLanguage: isHebrew ? 'בחר שפה' : 'Select Language',
    cancel: isHebrew ? 'ביטול' : 'Cancel',
    creating: isHebrew ? 'יוצר...' : 'Creating...',
    createUser: isHebrew ? 'צור משתמש' : 'Create User',
    error: isHebrew ? 'שגיאה ביצירת משתמש' : 'Error creating user'
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await sendUserInvitationByAdmin({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        language: formData.language
      });

      if (!result.success) {
        setError(result.error || text.error);
        setIsSubmitting(false);
        return;
      }

      // Reset form and close
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        role: 'user',
        language: 'he'
      });
      setIsOpen(false);

      // Show success message
      if (result.warning) {
        console.log('⚠️', result.warning);
        setSuccessMessage(`Invitation email sent to admin fallback email. ${result.warning}`);
      } else {
        console.log('✅ Invitation email sent to:', formData.email);
        setSuccessMessage(`Invitation email sent successfully to ${formData.email}!`);
      }

      // Refresh the page
      window.location.reload();
    } catch (err: any) {
      // Handle unexpected errors
      console.error('Unexpected error in form submission:', err);
      const errorMessage = err?.message || err?.errorInfo?.message || text.error;
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          {text.addUser}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" dir={isHebrew ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{text.title}</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">{text.fullName}</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{text.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{text.phone}</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{text.role}</Label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              required
            >
              <option value="">{text.selectRole}</option>
              <option value="user">{text.user}</option>
              <option value="admin">{text.admin}</option>
              <option value="super_admin">{text.superAdmin}</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language / שפה</Label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              required
            >
              <option value="">Select language</option>
              <option value="he">עברית (Hebrew)</option>
              <option value="en">English</option>
            </select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              {text.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? text.creating : text.createUser}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
