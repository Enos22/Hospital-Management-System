import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../lib/auth/AuthContext.jsx";
import ToastProvider from "../components/feedback/ToastProvider.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
