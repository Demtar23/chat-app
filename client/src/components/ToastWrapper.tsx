import { ToastContainer } from 'react-toastify';
import { useThemeContext } from '../context/ThemeContext';

export function ToastWrapper() {
  const { isDark } = useThemeContext();

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar={false}
      closeOnClick
      pauseOnHover
      theme={isDark ? 'dark' : 'light'}
    />
  );
}