
import { Link as RouterLink, useNavigate as RRDUseNavigate, useLocation, Navigate } from 'react-router-dom';

export const Link = RouterLink;
export const useNavigate = RRDUseNavigate;

export const useRouter = () => {
    const navigate = useNavigate();
    const location = useLocation();
    return {
        push: navigate,
        replace: (path: string) => navigate(path, { replace: true }),
        pathname: location.pathname,
        query: {},
        back: () => navigate(-1)
    };
};

export const usePathname = () => useLocation().pathname;
export const redirect = (url: string) => { window.location.href = url; };
