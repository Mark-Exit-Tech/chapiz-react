'use client';

import { useState, useEffect } from 'react';
import { getAllBusinesses, type Business } from '@/lib/firebase/database/businesses';
import { Store, MapPin, Phone, Mail, Globe, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    title: isHebrew ? 'ניהול עסקים' : 'Businesses Management',
    description: isHebrew ? 'נהלו וערכו את כל העסקים בפלטפורמה' : 'Manage and edit all businesses on the platform',
    loading: isHebrew ? 'טוען...' : 'Loading...',
    noBusinesses: isHebrew ? 'לא נמצאו עסקים' : 'No businesses found',
    name: isHebrew ? 'שם' : 'Name',
    category: isHebrew ? 'קטגוריה' : 'Category',
    location: isHebrew ? 'מיקום' : 'Location',
    phone: isHebrew ? 'טלפון' : 'Phone',
    email: isHebrew ? 'אימייל' : 'Email',
    website: isHebrew ? 'אתר' : 'Website',
    status: isHebrew ? 'סטטוס' : 'Status',
    actions: isHebrew ? 'פעולות' : 'Actions',
    active: isHebrew ? 'פעיל' : 'Active',
    inactive: isHebrew ? 'לא פעיל' : 'Inactive',
    totalBusinesses: isHebrew ? 'סה"כ עסקים' : 'Total Businesses'
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const data = await getAllBusinesses();
      setBusinesses(data);
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-gray-600">{text.loading}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="space-y-6">
        <div className="text-left rtl:text-right">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-8 h-8" />
            {text.title}
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            {text.description}
          </p>
          <div className="mt-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {text.totalBusinesses}: {businesses.length}
            </Badge>
          </div>
        </div>

        {businesses.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">{text.noBusinesses}</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{text.name}</TableHead>
                    <TableHead>{text.category}</TableHead>
                    <TableHead>{text.location}</TableHead>
                    <TableHead>{text.phone}</TableHead>
                    <TableHead>{text.status}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {business.imageUrl ? (
                            <img 
                              src={business.imageUrl} 
                              alt={business.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                              <Store className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold">{business.name}</div>
                            {business.website && (
                              <a 
                                href={business.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <Globe className="w-3 h-3" />
                                {text.website}
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {business.tags?.[0] || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{business.contactInfo?.address || business.address || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(business.contactInfo?.phone || business.phone) ? (
                          <a 
                            href={`tel:${business.contactInfo?.phone || business.phone}`}
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <Phone className="w-4 h-4" />
                            {business.contactInfo?.phone || business.phone}
                          </a>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={business.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {business.isActive !== false ? text.active : text.inactive}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
