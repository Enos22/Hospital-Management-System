import Provider from "./providers.jsx"
import AppRouter from "./router.jsx"
import { useToast } from "./providers.jsx"

function ToastViewport() {
  const { toasts } = useToast();

  return (
    <div className="toast-viewport">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} role="status">
          {t.message}
        </div>
      ))}

    </div>
  );
}

export default function App() {
  return (
    <Provider>
      <AppRouter />
      <ToastViewport />
    </Provider>
  );
}
