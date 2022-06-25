import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPathRoot } from 'tempus-core-services';

export const useNavigateToRoot = (): [() => void] => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const navigateToRoot = useCallback(() => {
    const pathRoot = getPathRoot(pathname);

    if (pathRoot === 'portfolio') {
      navigate('/portfolio/positions');
    } else {
      navigate('/');
    }
  }, [navigate, pathname]);

  return [navigateToRoot];
};
