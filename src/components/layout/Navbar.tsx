import { cn } from '@/lib/utils';
import {
  LogIn,
  LogOut,
  Mail,
  ShoppingBag,
  Menu,
  CircleUserRound,
  PawPrint,
  Ticket,
  Gift,
  MapPin,
  Shield,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { getContactInfo } from '@/lib/actions/admin';
import { getSiteSettings } from '@/lib/firebase/database/settings';
import { Button } from '../ui/button';
import OptimizedImage from '@/components/OptimizedImage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, loading, signOut, dbUser } = useAuth();
  const isAdmin = dbUser?.role === 'admin' || dbUser?.role === 'super_admin';
  const [isMounted, setIsMounted] = useState(false);
  const [storeUrl, setStoreUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const navigate = useNavigate();
  const locale = i18n.language || 'en';

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch store URL and logo from settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const info = await getContactInfo();
        if (info?.storeUrl) {
          setStoreUrl(info.storeUrl);
        }
        const settings = await getSiteSettings();
        if (settings?.logoUrl) {
          setLogoUrl(settings.logoUrl);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  // Show minimal navbar during hydration (don't block on auth loading)
  if (!isMounted) {
    return (
      <nav className="bg-white border-b">
        <div className="mx-auto max-w-7xl w-full px-4 md:px-6" dir="ltr">
          <div className="flex h-16 items-center justify-between">
            <div className="h-8 w-8" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b">
      <div className="mx-auto max-w-7xl w-full px-4 md:px-6" dir="ltr">
        <div className="flex h-14 sm:h-16 items-center justify-between flex-nowrap">
          {/* Brand / Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Chapiz"
                className="h-10 sm:h-12 w-auto object-contain"
                style={{ maxHeight: '48px' }}
                onError={(e) => {
                  e.currentTarget.src = '/assets/Chapiz-logo.png';
                }}
              />
            ) : (
              <img
                src="/assets/Chapiz-logo.png"
                alt="Chapiz"
                className="h-10 sm:h-12 w-auto object-contain"
                style={{ maxHeight: '48px' }}
                onError={(e) => {
                  e.currentTarget.src = '/assets/Chapiz-logo.png';
                }}
              />
            )}
          </Link>

          {/* Right Side Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-5 flex-shrink-0">
            {loading ? (
              <div className="h-8 w-8" />
            ) : user ? (
              <>
                {/* Mobile: Shop button and Burger menu */}
                <div className="md:hidden flex items-center gap-2">
                  {/* Store Button - Mobile */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => storeUrl && window.open(storeUrl, '_blank')}
                    className="border-primary text-primary hover:bg-primary/10 hover:text-primary hover:border-primary flex items-center justify-center whitespace-nowrap text-xs px-2 gap-1.5 transition-colors"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span className="text-center">{t('components.Navbar.chapizStore')}</span>
                  </Button>

                  {/* Burger menu - Mobile */}
                  <DropdownMenu dir={locale === 'he' ? 'rtl' : 'ltr'}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align={locale === 'he' ? 'start' : 'end'} sideOffset={8} collisionPadding={16}>
                      <div className="flex items-center gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none min-w-0">
                          {user?.displayName && (
                            <p className="font-medium">{user.displayName}</p>
                          )}
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/user/settings" className="flex items-center gap-2">
                          <CircleUserRound className="h-4 w-4 shrink-0" />
                          <span>{t('components.Navbar.profile')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/contact" className="flex items-center gap-2">
                          <Mail className="h-4 w-4 shrink-0" />
                          <span>{t('components.Navbar.contact')}</span>
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to={`/${locale}/admin`} className="flex items-center gap-2">
                              <Shield className="h-4 w-4 shrink-0" />
                              <span>{t('components.Navbar.adminPanel')}</span>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-primary flex items-center gap-2">
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span>{t('components.Navbar.signOut')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Desktop: Store Button and Burger Menu */}
                <div className="hidden md:flex items-center gap-5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => storeUrl && window.open(storeUrl, '_blank')}
                    className="border-primary text-primary hover:bg-primary/10 hover:text-primary hover:border-primary flex items-center justify-center whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 gap-1.5 sm:gap-2 transition-colors"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="text-center">{t('components.Navbar.chapizStore')}</span>
                  </Button>
                  <DropdownMenu dir={locale === 'he' ? 'rtl' : 'ltr'}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align={locale === 'he' ? 'start' : 'end'} sideOffset={8} collisionPadding={16}>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          {user?.displayName && (
                            <p className="font-medium">{user.displayName}</p>
                          )}
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      {/* My Pets, Coupons, Vouchers, Services */}
                      <DropdownMenuItem asChild>
                        <Link to="/pages/my-pets" className="flex items-center gap-2">
                          <PawPrint className="h-4 w-4 shrink-0" />
                          <span>{t('components.Navbar.myPets')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/coupons" className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 shrink-0" />
                          <span>{t('components.Navbar.allPromos')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/vouchers" className="flex items-center gap-2">
                          <Gift className="h-4 w-4 shrink-0" />
                          <span>{t('components.Navbar.coupons')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/services" className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>{t('components.Navbar.services')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {/* Settings and Actions */}
                      <DropdownMenuItem asChild>
                        <Link to="/user/settings" className="flex items-center gap-2">
                          <CircleUserRound className="h-4 w-4 shrink-0" />
                          <span>{t('components.Navbar.profile')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/contact" className="flex items-center gap-2">
                          <Mail className="h-4 w-4 shrink-0" />
                          <span>{t('components.Navbar.contact')}</span>
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to={`/${locale}/admin`} className="flex items-center gap-2">
                              <Shield className="h-4 w-4 shrink-0" />
                              <span>{t('components.Navbar.adminPanel')}</span>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-primary flex items-center gap-2">
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span>{t('components.Navbar.signOut')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <>
                {/* Desktop: Contact, Store, Sign In Button */}
                <div className="hidden md:flex items-center gap-5" dir="ltr">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/contact')}
                    className="flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {t('components.Navbar.contact')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => storeUrl && window.open(storeUrl, '_blank')}
                    className="border-primary text-primary hover:bg-primary/10 hover:text-primary hover:border-primary flex items-center justify-center whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 gap-1.5 sm:gap-2 transition-colors"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="text-center">{t('components.Navbar.chapizStore')}</span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate('/login')}
                    className="bg-primary hover:bg-primary hover:opacity-70 text-white border-primary flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 gap-1.5 sm:gap-2 transition-opacity"
                  >
                    <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {t('components.Navbar.signIn')}
                  </Button>
                </div>

                {/* Mobile: Shop button and Burger menu */}
                <div className="md:hidden flex items-center gap-2">
                  {/* Store Button - Mobile */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => storeUrl && window.open(storeUrl, '_blank')}
                    className="border-primary text-primary hover:bg-primary/10 hover:text-primary hover:border-primary flex items-center justify-center whitespace-nowrap text-xs px-2 gap-1.5 transition-colors"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span className="text-center">{t('components.Navbar.chapizStore')}</span>
                  </Button>

                  {/* Burger menu - Mobile */}
                  <DropdownMenu dir={locale === 'he' ? 'rtl' : 'ltr'}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align={locale === 'he' ? 'start' : 'end'} sideOffset={8} collisionPadding={16}>
                      <DropdownMenuItem asChild>
                        <Link to="/pages/my-pets" className="flex items-center gap-2">
                          <PawPrint className="h-4 w-4 shrink-0" />
                          <span>{t('components.Navbar.myPets')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/coupons" className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 shrink-0" />
                          <span>{t('components.Navbar.allPromos')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/vouchers" className="flex items-center gap-2">
                          <Gift className="h-4 w-4 shrink-0" />
                          <span>{t('components.Navbar.coupons')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/services" className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>{t('components.Navbar.services')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/contact" className="flex items-center gap-2">
                          <Mail className="h-4 w-4 shrink-0" />
                          <span>{t('components.Navbar.contact')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/login" className="flex items-center gap-2">
                          <LogIn className="h-4 w-4 shrink-0" />
                          <span>{t('components.Navbar.signIn')}</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
