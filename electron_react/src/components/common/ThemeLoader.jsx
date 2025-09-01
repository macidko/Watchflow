import { useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';

const ThemeLoader = () => {
  const { settings } = useSettings();

  useEffect(() => {
    // Theme loader sadece mount edildiğinde çalışır
    // Gerçek tema uygulaması useSettings hook'u içinde yapılır
  }, [settings]);

  return null; // Bu component hiçbir şey render etmez
};

export default ThemeLoader;
