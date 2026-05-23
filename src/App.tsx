import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ToastContainer from "./components/toastContainer";
import { AppHeader } from "./layout";
import ComparePage from "./pages/ComparePage";
import LandingPage from "./pages/LandingPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import MatchPage from "./pages/MatchPage";
import ProfilePage from "./pages/ProfilePage";
import useInitializeAppState from "./hooks/useInitializeAppState";
import useContextIfDefined from "./hooks/useContextIfDefined";
import { ToastsContext } from "./contexts/ToastsContext";

function App() {
  useInitializeAppState();
  const { toasts } = useContextIfDefined(ToastsContext);

  return (
    <ErrorBoundary>
      <ToastContainer toasts={toasts} />
      <AppHeader>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/match/:region/:matchId" element={<MatchPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route
            path="/compare/:region/:gameName/:tagLine"
            element={<ComparePage />}
          />
          <Route
            path="/profile/:region/:gameName/:tagLine"
            element={<ProfilePage />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppHeader>
    </ErrorBoundary>
  );
}

export default App;
