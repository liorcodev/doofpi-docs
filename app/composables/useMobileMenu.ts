export const useMobileMenu = () => {
  const isOpen = useState('mobile-menu-open', () => false);

  const toggle = () => {
    isOpen.value = !isOpen.value;
  };

  const close = () => {
    isOpen.value = false;
  };

  return {
    isOpen,
    toggle,
    close
  };
};
