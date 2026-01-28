'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNavigation from '@/components/layout/BottomNavigation';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const { locale } = useParams<{ locale: string }>();
  const lang = locale || 'en';
  const isHebrew = lang === 'he';

  const [email, setEmail] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error(t('pages.ForgotPasswordPage.errors.emailRequired'));
      return;
    }
    setFormLoading(true);
    try {
      await resetPassword(trimmed);
      setSuccess(true);
      toast.success(t('pages.ForgotPasswordPage.messages.resetLinkSent'));
    } catch (error: any) {
      const code = error?.code ?? '';
      if (code === 'auth/user-not-found') {
        toast.error(t('pages.ForgotPasswordPage.errors.userNotFound'));
      } else if (code === 'auth/invalid-email') {
        toast.error(t('pages.ForgotPasswordPage.errors.invalidEmail'));
      } else {
        toast.error(t('pages.ForgotPasswordPage.errors.generalError'));
      }
    } finally {
      setFormLoading(false);
    }
  };

  if (success) {
    return (
      <div dir={isHebrew ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className={`flex-1 flex flex-col pt-16 ${isHebrew ? 'pb-20' : 'pb-20'}`}>
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-xl">{t('pages.ForgotPasswordPage.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{t('pages.ForgotPasswordPage.messages.resetLinkSent')}</p>
                <p className="text-sm text-gray-500">{t('pages.ResetPasswordSentPage.subtitle')}</p>
                <Button
                  asChild
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Link to={`/${lang}/auth`}>
                    <ArrowLeft className={`h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 ${isHebrew ? 'rotate-180' : ''}`} />
                    {t('pages.ForgotPasswordPage.backToSignIn')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
        <div className="md:hidden">
          <BottomNavigation />
        </div>
      </div>
    );
  }

  return (
    <div dir={isHebrew ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex flex-col pt-16 pb-20">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl">{t('pages.ForgotPasswordPage.title')}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{t('pages.ForgotPasswordPage.subtitle')}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    {t('pages.ForgotPasswordPage.form.email')}
                  </label>
                  <div className="relative">
                    <Mail className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 ${isHebrew ? 'right-3' : 'left-3'}`} />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder={t('pages.ForgotPasswordPage.form.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={isHebrew ? 'pr-10 pl-4' : 'pl-10 pr-4'}
                      disabled={formLoading}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 rtl:ml-2 rtl:mr-0" />
                      {t('pages.ForgotPasswordPage.sending')}
                    </>
                  ) : (
                    t('pages.ForgotPasswordPage.sendResetLink')
                  )}
                </Button>
                <div className={`text-center ${isHebrew ? 'text-right' : ''}`}>
                  <Link
                    to={`/${lang}/auth`}
                    className="text-sm text-gray-600 hover:text-primary underline inline-flex items-center gap-1"
                  >
                    <ArrowLeft className={`h-4 w-4 ${isHebrew ? 'rotate-180' : ''}`} />
                    {t('pages.ForgotPasswordPage.backToSignIn')}
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}
