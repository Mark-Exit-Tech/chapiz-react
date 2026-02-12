import { useAuth } from '@/contexts/FirebaseAuthContext';
import { generateShopUrl, generateShareUrl, getCallbackUrl } from '@/lib/utils/shop-url';

export function useShopRedirect() {
  const { user } = useAuth();

  const redirectToShop = (shopUrl: string, coupon: string) => {
    if (!user) return;
    const url = generateShopUrl(shopUrl, user.uid, coupon);
    window.location.href = url;
  };

  const getShopUrl = (shopUrl: string, coupon: string) => {
    if (!user) return '';
    return generateShopUrl(shopUrl, user.uid, coupon);
  };

  const getShareUrl = (coupon: string) => {
    if (!user) return '';
    return generateShareUrl(user.uid, coupon);
  };

  return {
    redirectToShop,
    getShopUrl,
    getShareUrl,
    getCallbackUrl: user ? () => getCallbackUrl(user.uid) : () => '',
    isAuthenticated: !!user,
  };
}
