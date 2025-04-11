import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// This component will scroll to top when navigation occurs
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when path changes (but not when we have scrollTo state param)
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;