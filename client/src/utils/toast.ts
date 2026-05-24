import { toast } from 'react-toastify';

export const notify = {
  error: (message: string) => toast.error(message),
  success: (message: string) => toast.success(message),
  info: (message: string) => toast.info(message),
  warn: (message: string) => toast.warn(message),
};
