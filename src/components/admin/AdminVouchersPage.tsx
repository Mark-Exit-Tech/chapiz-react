'use client';

import { useState, useEffect } from 'react';
import { getAllVouchers, type Voucher } from '@/lib/firebase/database/vouchers';
import { Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AddVoucherForm from '@/components/admin/AddVoucherForm';

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    title: isHebrew ? 'ניהול שוברים' : 'Vouchers Management',
    description: isHebrew ? 'נהלו וערכו את כל השוברים בפלטפורמה' : 'Manage and edit all vouchers on the platform',
    loading: isHebrew ? 'טוען...' : 'Loading...',
    noVouchers: isHebrew ? 'אין שוברים' : 'No vouchers found',
    addVoucher: isHebrew ? 'הוסף שובר' : 'Add Voucher',
    totalVouchers: isHebrew ? 'סה"כ שוברים' : 'Total Vouchers',
    name: isHebrew ? 'שם' : 'Name',
    price: isHebrew ? 'מחיר' : 'Price',
    points: isHebrew ? 'נקודות' : 'Points',
    validFrom: isHebrew ? 'תקף מ' : 'Valid From',
    validTo: isHebrew ? 'תקף עד' : 'Valid To',
    status: isHebrew ? 'סטטוס' : 'Status',
    active: isHebrew ? 'פעיל' : 'Active',
    inactive: isHebrew ? 'לא פעיל' : 'Inactive',
    free: isHebrew ? 'חינם' : 'Free'
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const data = await getAllVouchers();
      setVouchers(data);
    } catch (error) {
      console.error('Error loading vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(isHebrew ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="text-left rtl:text-right">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Ticket className="w-8 h-8" />
              {text.title}
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              {text.description}
            </p>
            <div className="mt-4">
              <Badge variant="outline" className="text-lg px-4 py-2">
                {text.totalVouchers}: {vouchers.length}
              </Badge>
            </div>
          </div>
          <div>
            <AddVoucherForm />
          </div>
        </div>

        {/* Vouchers Table */}
        {vouchers.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">{text.noVouchers}</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {text.name}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {text.price}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {text.validFrom}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {text.validTo}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {text.status}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vouchers.map((voucher) => (
                    <tr key={voucher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {voucher.imageUrl ? (
                            <img 
                              src={voucher.imageUrl} 
                              alt={voucher.name}
                              className="w-10 h-10 rounded-md object-cover mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center mr-3">
                              <Ticket className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{voucher.name}</div>
                            {voucher.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {voucher.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {voucher.price === 0 ? text.free : `₪${voucher.price}`}
                        </div>
                        {voucher.points > 0 && (
                          <div className="text-xs text-gray-500">{voucher.points} {text.points}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(voucher.validFrom)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(voucher.validTo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={voucher.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {voucher.isActive ? text.active : text.inactive}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
