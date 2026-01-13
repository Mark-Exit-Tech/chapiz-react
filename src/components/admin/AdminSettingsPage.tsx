'use client';

import { useState } from 'react';
import { Settings, Cookie, Smartphone, Bell, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CookieSettingsForm from '@/components/admin/CookieSettingsForm';
import InstallBannerSettingsForm from '@/components/admin/InstallBannerSettingsForm';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    title: isHebrew ? 'הגדרות' : 'Settings',
    description: isHebrew ? 'נהל את הגדרות האפליקציה והמערכת' : 'Manage application and system settings',
    general: isHebrew ? 'כללי' : 'General',
    cookies: isHebrew ? 'עוגיות' : 'Cookies',
    installBanner: isHebrew ? 'באנר התקנה' : 'Install Banner',
    notifications: isHebrew ? 'התראות' : 'Notifications',
    security: isHebrew ? 'אבטחה' : 'Security',
    
    // General settings
    siteName: isHebrew ? 'שם האתר' : 'Site Name',
    siteNamePlaceholder: isHebrew ? 'הזן שם אתר' : 'Enter site name',
    siteDescription: isHebrew ? 'תיאור האתר' : 'Site Description',
    siteDescriptionPlaceholder: isHebrew ? 'הזן תיאור אתר' : 'Enter site description',
    maintenanceMode: isHebrew ? 'מצב תחזוקה' : 'Maintenance Mode',
    maintenanceModeDesc: isHebrew ? 'הפעל מצב תחזוקה לאתר' : 'Enable maintenance mode for the site',
    
    save: isHebrew ? 'שמור' : 'Save',
    saving: isHebrew ? 'שומר...' : 'Saving...',
    saved: isHebrew ? 'נשמר בהצלחה' : 'Saved successfully'
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

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">{text.general}</span>
            </TabsTrigger>
            <TabsTrigger value="cookies" className="flex items-center gap-2">
              <Cookie className="w-4 h-4" />
              <span className="hidden md:inline">{text.cookies}</span>
            </TabsTrigger>
            <TabsTrigger value="install" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span className="hidden md:inline">{text.installBanner}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden md:inline">{text.notifications}</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden md:inline">{text.security}</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{text.general}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{text.siteName}</label>
                  <input 
                    type="text" 
                    placeholder={text.siteNamePlaceholder}
                    className="w-full px-3 py-2 border rounded-md"
                    defaultValue="Chapiz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{text.siteDescription}</label>
                  <textarea 
                    placeholder={text.siteDescriptionPlaceholder}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                    defaultValue="Pet services and community platform"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="maintenance" className="w-4 h-4" />
                  <div>
                    <label htmlFor="maintenance" className="font-medium cursor-pointer">
                      {text.maintenanceMode}
                    </label>
                    <p className="text-sm text-gray-500">{text.maintenanceModeDesc}</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {text.save}
                </button>
              </div>
            </div>
          </TabsContent>

          {/* Cookie Settings */}
          <TabsContent value="cookies" className="space-y-4">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{text.cookies}</h2>
              <CookieSettingsForm />
            </div>
          </TabsContent>

          {/* Install Banner Settings */}
          <TabsContent value="install" className="space-y-4">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{text.installBanner}</h2>
              <InstallBannerSettingsForm />
            </div>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{text.notifications}</h2>
              <p className="text-gray-500">
                {isHebrew ? 'הגדרות התראות - בקרוב' : 'Notification settings - Coming soon'}
              </p>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{text.security}</h2>
              <p className="text-gray-500">
                {isHebrew ? 'הגדרות אבטחה - בקרוב' : 'Security settings - Coming soon'}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
