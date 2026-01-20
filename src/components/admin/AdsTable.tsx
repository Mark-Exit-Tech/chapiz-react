'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Ad, getAllAds, AdStatus } from '@/lib/actions/admin';
import AdActions from './AdActions';

export default function AdsTable() {
  const { t } = useTranslation('Admin');
  const { t: tCommon } = useTranslation('common');
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewAd, setPreviewAd] = useState<Ad | null>(null);
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    loading: isHebrew ? 'טוען...' : 'Loading...',
    title: isHebrew ? 'כותרת' : 'Title',
    type: isHebrew ? 'סוג' : 'Type',
    image: isHebrew ? 'תמונה' : 'Image',
    status: isHebrew ? 'סטטוס' : 'Status',
    created: isHebrew ? 'נוצר' : 'Created',
    noAds: isHebrew ? 'לא נמצאו מודעות' : 'No advertisements found',
    noImage: isHebrew ? 'אין תמונה' : 'No Image',
    statusActive: isHebrew ? 'פעיל' : 'Active',
    statusScheduled: isHebrew ? 'מתוזמן' : 'Scheduled',
    statusDraft: isHebrew ? 'טיוטה' : 'Draft',
    statusInactive: isHebrew ? 'לא פעיל' : 'Inactive',
    actions: isHebrew ? 'פעולות' : 'Actions'
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const result = await getAllAds(1, 1000); // Get all ads
      if (result.ads) {
        setAds(result.ads);
      } else {
        setError('Failed to fetch ads');
      }
    } catch (err) {
      setError('Failed to fetch ads');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  const getStatusBadge = (status: AdStatus) => {
    const statusConfig = {
      active: { label: text.statusActive, className: 'bg-green-100 text-green-800' },
      scheduled: { label: text.statusScheduled, className: 'bg-yellow-100 text-yellow-800' },
      draft: { label: text.statusDraft, className: 'bg-gray-100 text-gray-800' },
      inactive: { label: text.statusInactive, className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">{text.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded border border-red-400 bg-red-100 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={isHebrew ? 'text-right' : ''}>{text.title}</TableHead>
              <TableHead className={isHebrew ? 'text-right' : ''}>{text.type}</TableHead>
              <TableHead className={isHebrew ? 'text-right' : ''}>{text.image}</TableHead>
              <TableHead className={isHebrew ? 'text-right' : ''}>{text.status}</TableHead>
              <TableHead className={isHebrew ? 'text-right' : ''}>{text.created}</TableHead>
              <TableHead className={`w-[50px] ${isHebrew ? 'text-right' : 'text-center'}`}>{text.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {ads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {text.noAds}
                  </TableCell>
                </TableRow>
            ) : (
              ads.map((ad) => (
                <TableRow
                  key={ad.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setPreviewAd(ad)}
                >
                  <TableCell className="font-medium">{ad.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ad.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {ad.content ? (
                      <div className="w-16 h-10 rounded-md overflow-hidden">
                        <img
                          src={ad.content}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                        <span className="text-xs text-gray-400">{text.noImage}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className={isHebrew ? 'text-right' : ''}>{getStatusBadge(ad.status)}</TableCell>
                  <TableCell className={isHebrew ? 'text-right' : ''}>{formatDate(ad.createdAt)}</TableCell>
                  <TableCell
                    className={isHebrew ? 'text-right' : 'text-center'}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AdActions ad={ad} onDelete={fetchAds} onUpdate={fetchAds} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewAd} onOpenChange={(open) => !open && setPreviewAd(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {previewAd && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{previewAd.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Image */}
                {previewAd.content && (
                  <div className="rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={previewAd.content}
                      alt={previewAd.title}
                      className="w-full h-auto object-contain max-h-[500px] mx-auto"
                    />
                  </div>
                )}

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-600">{text.type}: </span>
                    <Badge variant="outline">{previewAd.type}</Badge>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">{text.status}: </span>
                    {getStatusBadge(previewAd.status)}
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold text-gray-600">{text.created}: </span>
                    <span>{formatDate(previewAd.createdAt)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

