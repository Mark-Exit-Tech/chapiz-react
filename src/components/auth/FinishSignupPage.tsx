'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MainLayout from '@/components/layout/MainLayout';

export default function FinishSignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsEmail, setNeedsEmail] = useState(false);

  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'he'
    : 'he';
  const isHebrew = locale === 'he';

  const text = {
    title: isHebrew ? 'השלמת הרשמה' : 'Complete Signup',
    enterEmail: isHebrew ? 'הזן את האימייל שלך' : 'Enter your email',
    emailLabel: isHebrew ? 'אימייל' : 'Email',
    submit: isHebrew ? 'אישור' : 'Confirm',
    processing: isHebrew ? 'מעבד...' : 'Processing...',
    success: isHebrew ? 'ההרשמה הושלמה בהצלחה!' : 'Signup completed successfully!',
    invalidLink: isHebrew ? 'קישור לא תקין' : 'Invalid link',
    error: isHebrew ? 'שגיאה בהשלמת ההרשמה' : 'Error completing signup'
  };

  useEffect(() => {
    const completeSignIn = async () => {
      // Check if this is a valid sign-in link
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        setError(text.invalidLink);
        setLoading(false);
        return;
      }

      // Get email from localStorage (stored when invite was sent)
      let storedEmail = window.localStorage.getItem('emailForSignIn');

      if (!storedEmail) {
        // If no email in storage, ask user to provide it
        setNeedsEmail(true);
        setLoading(false);
        return;
      }

      try {
        await signInWithEmailLink(auth, storedEmail, window.location.href);
        window.localStorage.removeItem('emailForSignIn');

        // Redirect to home or dashboard
        navigate(`/${locale}`);
      } catch (err: any) {
        console.error('Error completing sign-in:', err);
        setError(err.message || text.error);
        setLoading(false);
      }
    };

    completeSignIn();
  }, []);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
      navigate(`/${locale}`);
    } catch (err: any) {
      console.error('Error completing sign-in:', err);
      setError(err.message || text.error);
      setLoading(false);
    }
  };

  if (loading && !needsEmail) {
    return (
      <MainLayout direction={isHebrew ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>{text.processing}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout direction={isHebrew ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-2xl font-bold text-center">{text.title}</h1>

          {error && (
            <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {needsEmail && (
            <form onSubmit={handleSubmitEmail} className="space-y-4">
              <p className="text-gray-600 text-center">{text.enterEmail}</p>
              <div className="space-y-2">
                <Label htmlFor="email">{text.emailLabel}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  dir="ltr"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? text.processing : text.submit}
              </Button>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
