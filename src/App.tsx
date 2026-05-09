import "./App.css";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ToastContainer from "./components/toastContainer";
import HomePage from "./pages/Home";
import useInitializeAppState from "./hooks/useInitializeAppState";
import useContextIfDefined from "./hooks/useContextIfDefined";
import { ToastsContext } from "./contexts/ToastsContext";

function App() {
  useInitializeAppState();
  const { toasts } = useContextIfDefined(ToastsContext);

  return (
    <ErrorBoundary>
      <ToastContainer toasts={toasts} />
      <HomePage />
    </ErrorBoundary>
  );
}

export default App;
