'use client';

import { useState } from 'react';
import { Settings, Mail, Phone, MapPin, Clock, Image, Globe, Instagram, Facebook } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    title: isHebrew ? 'הגדרות האתר' : 'Site Settings',
    description: isHebrew ? 'נהל את פרטי הקשר, לוגו וקישורי רשתות חברתיות' : 'Manage contact details, logo and social media links',
    
    // Contact Info
    contactInfo: isHebrew ? 'פרטי קשר' : 'Contact Information',
    siteName: isHebrew ? 'שם האתר' : 'Site Name',
    siteNamePlaceholder: isHebrew ? 'Chapiz' : 'Chapiz',
    email: isHebrew ? 'אימייל' : 'Email',
    emailPlaceholder: isHebrew ? 'info@chapiz.co.il' : 'info@chapiz.co.il',
    phone: isHebrew ? 'טלפון' : 'Phone',
    phonePlaceholder: isHebrew ? '+972-50-123-4567' : '+972-50-123-4567',
    address: isHebrew ? 'כתובת' : 'Address',
    addressPlaceholder: isHebrew ? 'תל אביב, ישראל' : 'Tel Aviv, Israel',
    workHours: isHebrew ? 'שעות פעילות' : 'Work Hours',
    workHoursPlaceholder: isHebrew ? 'ראשון-חמישי: 9:00-18:00' : 'Sunday-Thursday: 9:00-18:00',
    
    // Branding
    branding: isHebrew ? 'מיתוג' : 'Branding',
    logo: isHebrew ? 'לוגו' : 'Logo',
    logoHelp: isHebrew ? 'העלה לוגו לאתר (מומלץ: PNG עם רקע שקוף)' : 'Upload site logo (recommended: PNG with transparent background)',
    uploadLogo: isHebrew ? 'העלה לוגו' : 'Upload Logo',
    
    // Social Links
    socialLinks: isHebrew ? 'קישורי רשתות חברתיות' : 'Social Media Links',
    facebook: isHebrew ? 'Facebook' : 'Facebook',
    facebookPlaceholder: isHebrew ? 'https://facebook.com/chapiz' : 'https://facebook.com/chapiz',
    instagram: isHebrew ? 'Instagram' : 'Instagram',
    instagramPlaceholder: isHebrew ? 'https://instagram.com/chapiz' : 'https://instagram.com/chapiz',
    website: isHebrew ? 'אתר אינטרנט' : 'Website',
    websitePlaceholder: isHebrew ? 'https://chapiz.co.il' : 'https://chapiz.co.il',
    
    save: isHebrew ? 'שמור שינויים' : 'Save Changes',
    saving: isHebrew ? 'שומר...' : 'Saving...',
    saved: isHebrew ? 'נשמר בהצלחה' : 'Saved successfully'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // TODO: Save settings to database
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert(text.saved);
    setSaving(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-left rtl:text-right">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-8 h-8" />
            {text.title}
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            {text.description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              {text.contactInfo}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">{text.siteName}</Label>
                <Input
                  id="siteName"
                  type="text"
                  placeholder={text.siteNamePlaceholder}
                  defaultValue="Chapiz"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {text.email}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={text.emailPlaceholder}
                  defaultValue="info@chapiz.co.il"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {text.phone}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={text.phonePlaceholder}
                  defaultValue="+972-50-123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {text.address}
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder={text.addressPlaceholder}
                  defaultValue="Tel Aviv, Israel"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="workHours" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {text.workHours}
                </Label>
                <Textarea
                  id="workHours"
                  placeholder={text.workHoursPlaceholder}
                  rows={2}
                  defaultValue="Sunday-Thursday: 9:00-18:00&#10;Friday: 9:00-14:00"
                />
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Image className="w-5 h-5" />
              {text.branding}
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">{text.logo}</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <Button type="button" variant="outline">
                      {text.uploadLogo}
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">{text.logoHelp}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {text.socialLinks}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <Facebook className="w-4 h-4" />
                  {text.facebook}
                </Label>
                <Input
                  id="facebook"
                  type="url"
                  placeholder={text.facebookPlaceholder}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  {text.instagram}
                </Label>
                <Input
                  id="instagram"
                  type="url"
                  placeholder={text.instagramPlaceholder}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {text.website}
                </Label>
                <Input
                  id="website"
                  type="url"
                  placeholder={text.websitePlaceholder}
                  defaultValue="https://chapiz.co.il"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="px-6">
              {saving ? text.saving : text.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
