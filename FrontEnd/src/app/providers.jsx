/*
 * TODO: Compose application-wide providers such as query cache, auth, and toasts.
 */
import { createContext, useContext, useState, useCallback } from "react";
import { AuthProvider } from "../lib/auth/AuthContext.jsx";

const ToastContext = createContext(null);

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) throw new Error("UseToast must be used inside Providers");
    return context;

}

export default function Providers({ children }) {
    const [toasts, setToasts] = useState([]);

    const pushToast = useCallback((message, type = "info") => {

        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);

    }, []);

    return (
        <ToastContext.Provider value={{ toasts, pushToast, success: (m) => pushToast(m, "success"), error: (m) => pushToast(m, "error") }}>
            <AuthProvider>{children}</AuthProvider>
        </ToastContext.Provider>
    );
}