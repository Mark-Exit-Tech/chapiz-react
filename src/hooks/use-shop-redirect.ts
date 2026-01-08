// Stub hook for shop redirect
export function useShopRedirect() {
  return {
    redirectToShop: (url?: string, code?: string, ...args: any[]) => {
      console.log('Shop redirect not implemented', url, code);
    },
    getShopUrl: () => {
      return '';
    }
  };
}