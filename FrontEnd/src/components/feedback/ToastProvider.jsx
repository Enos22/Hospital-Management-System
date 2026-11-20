import toast, { Toaster } from "react-hot-toast";

export default function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
}

export function useToast() {
  return {
    success: (message) => toast.success(message),
    error: (message) => toast.error(message),
    dismiss: (id) => toast.dismiss(id),
  };
}
