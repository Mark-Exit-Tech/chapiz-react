// Firebase Cloud Function URL for the shopCallback endpoint
const CALLBACK_BASE_URL = 'https://us-central1-facepet-48b13.cloudfunctions.net/shopCallback';

/**
 * Get the callback URL for a given user
 */
export function getCallbackUrl(userId: string): string {
  return `${CALLBACK_BASE_URL}?userid=${userId}`;
}

/**
 * Generate a share URL that includes userid, coupon, and callback parameters
 * When someone visits this link, the app will call the callback to award 20 points
 *
 * Example output: https://chapiz.co.il/?userid=abc123&coupon=sale990&callback=https%3A%2F%2F...shopCallback%3Fuserid%3Dabc123
 */
export function generateShareUrl(
  userId: string,
  coupon: string,
  siteUrl: string = 'https://chapiz.co.il'
): string {
  const callbackUrl = getCallbackUrl(userId);
  const url = new URL(siteUrl);
  url.searchParams.set('userid', userId);
  url.searchParams.set('coupon', coupon);
  url.searchParams.set('callback', callbackUrl);
  return url.toString();
}

/**
 * Generate a shop URL with userid, coupon, and callback parameters
 */
export function generateShopUrl(
  shopUrl: string,
  userId: string,
  coupon: string,
  callbackUrl?: string,
): string {
  const finalCallbackUrl = callbackUrl || getCallbackUrl(userId);
  const cleanShopUrl = shopUrl.replace(/\/$/, '');
  const url = new URL(cleanShopUrl);
  url.searchParams.set('userid', userId);
  url.searchParams.set('coupon', coupon);
  url.searchParams.set('callback', finalCallbackUrl);
  return url.toString();
}

/**
 * Generate a shop URL with additional custom parameters
 */
export function generateShopUrlWithParams(
  shopUrl: string,
  params: {
    userid: string;
    coupon: string;
    callback?: string;
    [key: string]: string | undefined;
  },
): string {
  const cleanShopUrl = shopUrl.replace(/\/$/, '');
  const url = new URL(cleanShopUrl);

  url.searchParams.set('userid', params.userid);
  url.searchParams.set('coupon', params.coupon);
  url.searchParams.set('callback', params.callback || getCallbackUrl(params.userid));

  Object.keys(params).forEach(key => {
    if (key !== 'userid' && key !== 'coupon' && key !== 'callback' && params[key]) {
      url.searchParams.set(key, params[key]!);
    }
  });

  return url.toString();
}

