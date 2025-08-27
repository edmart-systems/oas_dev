export const restoreScrollPosition = (position: number, delay: number = 100) => {
  if (position <= 0) return;
  
  // Use requestAnimationFrame for better performance
  const restore = () => {
    window.scrollTo({
      top: position,
      behavior: 'auto'
    });
  };
  
  // Try multiple times to ensure DOM is ready
  setTimeout(restore, delay);
  setTimeout(restore, delay * 2);
  
  // Also try on next frame
  requestAnimationFrame(() => {
    setTimeout(restore, 50);
  });
};

export const saveScrollPosition = (): number => {
  return window.scrollY || document.documentElement.scrollTop || 0;
};