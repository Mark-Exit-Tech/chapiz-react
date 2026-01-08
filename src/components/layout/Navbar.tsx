import { cn } from '@/lib/utils';
import {
  LogIn,
  LogOut,
  Mail,
  ShoppingBag,
  Menu,
  CircleUserRound,
  PawPrint,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, loading, signOut } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();
  const locale = i18n.language || 'en';

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
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

  // Show loading state during hydration
  if (!isMounted || loading) {
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
            <img
              src="/assets/Facepet.png"
              alt="Chapiz"
              className="h-8 sm:h-10 w-auto object-contain"
            />
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
                    onClick={() => window.open('https://chapiz.store', '_blank')}
                    className="border-primary text-primary hover:bg-primary/10 hover:text-primary hover:border-primary flex items-center justify-center whitespace-nowrap text-xs px-2 gap-1.5 transition-colors"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span className="text-center">{t('components.Navbar.chapizStore')}</span>
                  </Button>

                  {/* Burger menu - Mobile */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align={locale === 'he' ? 'start' : 'end'}>
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
                      {/* Settings and Actions */}
                      <DropdownMenuItem asChild>
                        <Link to="/user/settings" className="flex items-center">
                          <CircleUserRound className="mr-2 h-4 w-4" />
                          <span>{t('components.Navbar.profile')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/contact" className="flex items-center">
                          <Mail className="mr-2 h-4 w-4" />
                          <span>{t('components.Navbar.contact')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-primary">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t('components.Navbar.signOut')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Desktop: Store Button and Burger Menu */}
                <div className="hidden md:flex items-center gap-5" dir="ltr">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://chapiz.store', '_blank')}
                    className="border-primary text-primary hover:bg-primary/10 hover:text-primary hover:border-primary flex items-center justify-center whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 gap-1.5 sm:gap-2 transition-colors"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="text-center">{t('components.Navbar.chapizStore')}</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align={locale === 'he' ? 'start' : 'end'}>
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
                      {/* Desktop Navigation Items */}
                      <div className="hidden md:block">
                        <DropdownMenuItem asChild>
                          <Link to="/pages/my-pets" className="flex items-center">
                            <PawPrint className="mr-2 h-4 w-4" />
                            <span>{t('components.Navbar.myPets')}</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </div>
                      {/* Settings and Actions */}
                      <DropdownMenuItem asChild>
                        <Link to="/user/settings" className="flex items-center">
                          <CircleUserRound className="mr-2 h-4 w-4" />
                          <span>{t('components.Navbar.profile')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/contact" className="flex items-center">
                          <Mail className="mr-2 h-4 w-4" />
                          <span>{t('components.Navbar.contact')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-primary">
                        <LogOut className="mr-2 h-4 w-4" />
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
                    onClick={() => window.open('https://chapiz.store', '_blank')}
                    className="border-primary text-primary hover:bg-primary/10 hover:text-primary hover:border-primary flex items-center justify-center whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 gap-1.5 sm:gap-2 transition-colors"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="text-center">{t('components.Navbar.chapizStore')}</span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate('/auth')}
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
                    onClick={() => window.open('https://chapiz.store', '_blank')}
                    className="border-primary text-primary hover:bg-primary/10 hover:text-primary hover:border-primary flex items-center justify-center whitespace-nowrap text-xs px-2 gap-1.5 transition-colors"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span className="text-center">{t('components.Navbar.chapizStore')}</span>
                  </Button>

                  {/* Burger menu - Mobile */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align={locale === 'he' ? 'start' : 'end'}>
                      <DropdownMenuItem asChild>
                        <Link to="/contact" className="flex items-center">
                          <Mail className="mr-2 h-4 w-4" />
                          <span>{t('components.Navbar.contact')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/auth" className="flex items-center">
                          <LogIn className="mr-2 h-4 w-4" />
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
