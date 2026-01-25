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
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase/client';

// Send email invite using Resend via Cloud Function
const sendUserInvitationByAdmin = async (data: { email: string; locale: string }): Promise<{ success: boolean; error?: string }> => {
  try {
    const functions = getFunctions(app);
    const sendInviteEmail = httpsCallable(functions, 'sendInviteEmail');

    const inviteUrl = `${window.location.origin}/${data.locale}/signup`;

    const result = await sendInviteEmail({
      email: data.email,
      inviteUrl,
      locale: data.locale
    });

    console.log('✅ Invitation email sent to:', data.email, result);
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
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'he'
    : 'he';
  const isHebrew = locale === 'he';

  // HARDCODED TEXT
  const text = {
    addUser: isHebrew ? 'שלח הזמנה' : 'Send Invite',
    title: isHebrew ? 'שלח הזמנה באימייל' : 'Send Email Invite',
    email: isHebrew ? 'אימייל' : 'Email',
    cancel: isHebrew ? 'ביטול' : 'Cancel',
    sending: isHebrew ? 'שולח...' : 'Sending...',
    sendInvite: isHebrew ? 'שלח הזמנה' : 'Send Invite',
    error: isHebrew ? 'שגיאה בשליחת הזמנה' : 'Error sending invite',
    success: isHebrew ? 'הזמנה נשלחה בהצלחה!' : 'Invitation sent successfully!'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await sendUserInvitationByAdmin({
        email,
        locale
      });

      if (!result.success) {
        setError(result.error || text.error);
        setIsSubmitting(false);
        return;
      }

      // Reset form and close
      setEmail('');
      setIsOpen(false);

      // Show success alert
      alert(text.success);
    } catch (err: any) {
      console.error('Unexpected error in form submission:', err);
      setError(err?.message || text.error);
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{text.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
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
