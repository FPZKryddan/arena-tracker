import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import "./App.css";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ToastContainer from "./components/toastContainer";
import { AppHeader, AppSideNav } from "./layout";
import ComparePage from "./pages/ComparePage";
import LandingPage from "./pages/LandingPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import MatchPage from "./pages/MatchPage";
import ProfilePage from "./pages/ProfilePage";
import ArenaReferencePage from "./pages/ArenaReferencePage";
import useInitializeAppState from "./hooks/useInitializeAppState";
import useContextIfDefined from "./hooks/useContextIfDefined";
import { ToastsContext } from "./contexts/ToastsContext";

const AppShell = () => (
  <AppSideNav>
    <Outlet />
  </AppSideNav>
);

const LandingShell = () => (
  <AppHeader>
    <LandingPage />
  </AppHeader>
);

function App() {
  useInitializeAppState();
  const { toasts } = useContextIfDefined(ToastsContext);

  return (
    <ErrorBoundary>
      <ToastContainer toasts={toasts} />
      <Routes>
        <Route path="/" element={<LandingShell />} />
        <Route element={<AppShell />}>
          <Route path="/reference" element={<ArenaReferencePage />} />
          <Route
            path="/augments"
            element={<Navigate to="/reference" replace />}
          />
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
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
