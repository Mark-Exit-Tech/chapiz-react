// Stub hook for random ads
export interface Ad {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  duration?: number;
  type?: string;
}

export function useRandomAd() {
  return {
    ad: null as Ad | null,
    loading: false,
    error: null
  };
}