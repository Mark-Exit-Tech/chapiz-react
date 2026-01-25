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
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

// Send email invite using Firebase Auth magic link
const sendUserInvitationByAdmin = async (data: { email: string }): Promise<{ success: boolean; error?: string }> => {
  try {
    const actionCodeSettings = {
      // URL to redirect to after email link is clicked
      url: `${window.location.origin}/he/auth/finish-signup`,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, data.email, actionCodeSettings);

    // Store email in localStorage so we can use it when user clicks the link
    window.localStorage.setItem('emailForSignIn', data.email);

    console.log('✅ Invitation email sent to:', data.email);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending invitation:', error);
    return {
      success: false,
      error: error.message || 'Failed to send invitation email'
    };
  }
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
    addUser: isHebrew ? 'שלח הזמנה' : 'Send Invite',
    title: isHebrew ? 'שלח הזמנה באימייל' : 'Send Email Invite',
    email: isHebrew ? 'אימייל' : 'Email',
    cancel: isHebrew ? 'ביטול' : 'Cancel',
    sending: isHebrew ? 'שולח...' : 'Sending...',
    sendInvite: isHebrew ? 'שלח הזמנה' : 'Send Invite',
    error: isHebrew ? 'שגיאה בשליחת הזמנה' : 'Error sending invite'
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
        email: formData.email
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
        setSuccessMessage(isHebrew
          ? `הזמנה נשלחה לאימייל הניהול. ${result.warning}`
          : `Invitation sent to admin fallback email. ${result.warning}`);
      } else {
        console.log('✅ Invitation email sent to:', formData.email);
        setSuccessMessage(isHebrew
          ? `הזמנה נשלחה בהצלחה ל-${formData.email}!`
          : `Invitation sent successfully to ${formData.email}!`);
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              {text.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? text.sending : text.sendInvite}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
