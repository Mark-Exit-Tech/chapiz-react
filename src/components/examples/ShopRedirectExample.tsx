'use client';

import { useState } from 'react';
import { useShopRedirect } from '@/hooks/use-shop-redirect';
import { Button } from '@/components/ui/button';

/**
 * Example component showing how to use the shop redirect and share URLs
 */
export default function ShopRedirectExample() {
  const { redirectToShop, getShopUrl, getShareUrl, getCallbackUrl, isAuthenticated } = useShopRedirect();
  const [shopUrl, setShopUrl] = useState('https://shop.example.com');
  const [coupon, setCoupon] = useState('COUPON123');
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const handleSimpleRedirect = () => {
    if (!isAuthenticated) {
      alert('Please log in first');
      return;
    }
    redirectToShop(shopUrl, coupon);
  };

  const handleGenerateUrl = () => {
    if (!isAuthenticated) {
      alert('Please log in first');
      return;
    }
    const url = getShopUrl(shopUrl, coupon);
    setGeneratedUrl(url);
  };

  const handleGenerateShareUrl = () => {
    if (!isAuthenticated) {
      alert('Please log in first');
      return;
    }
    const url = getShareUrl(coupon);
    setShareUrl(url);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 border rounded-lg bg-yellow-50">
        <p className="text-sm text-yellow-800">
          Please log in to use shop redirect functionality
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold">Shop Redirect Example</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Shop URL</label>
          <input
            type="text"
            value={shopUrl}
            onChange={(e) => setShopUrl(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="https://shop.example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Coupon Code</label>
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="COUPON123"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Button onClick={handleSimpleRedirect} className="w-full">
          Redirect to Shop
        </Button>
        <Button onClick={handleGenerateUrl} variant="outline" className="w-full">
          Generate Shop URL
        </Button>
        <Button onClick={handleGenerateShareUrl} variant="outline" className="w-full">
          Generate Share URL (awards 20 points on visit)
        </Button>
      </div>

      {generatedUrl && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Shop URL:</h3>
          <div className="flex gap-2">
            <code className="flex-1 p-2 bg-white border rounded text-sm break-all">{generatedUrl}</code>
            <Button onClick={() => handleCopyUrl(generatedUrl)} size="sm" variant="outline">Copy</Button>
          </div>
        </div>
      )}

      {shareUrl && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold mb-2">Share URL (20 points on visit):</h3>
          <div className="flex gap-2">
            <code className="flex-1 p-2 bg-white border rounded text-sm break-all">{shareUrl}</code>
            <Button onClick={() => handleCopyUrl(shareUrl)} size="sm" variant="outline">Copy</Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Callback: <code className="bg-white px-1 rounded">{getCallbackUrl()}</code>
          </p>
        </div>
      )}

      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">How it works:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>Share button generates URL: <code className="bg-white px-1 rounded">chapiz.co.il/?userid=xxx&coupon=xxx&callback=...</code></li>
          <li>When someone visits the shared link, the app calls the callback URL</li>
          <li>The callback awards 20 points to the sharing user</li>
        </ol>
      </div>
    </div>
  );
}
