import { Navigate, useNavigate, useParams } from "react-router-dom";
import MatchDetailModal from "../components/matchDetail/MatchDetailModal";
import { normalizeRegion } from "../hooks/useApiBase";
import type { Regions } from "../types";

type Region = Exclude<Regions, null>;

const MatchPage = () => {
  const navigate = useNavigate();
  const params = useParams<{ region: string; matchId: string }>();
  const matchId = params.matchId ? decodeURIComponent(params.matchId) : null;
  const region = normalizeRegion(params.region) as Region;

  if (!matchId) return <Navigate to="/" replace />;

  return (
    <div className="box-border flex min-h-dvh w-full flex-col gap-5 bg-bg p-3 text-fg md:gap-7 md:p-6">
      <main className="flex min-h-72 flex-1 items-center justify-center">
        <div className="w-full max-w-lg rounded-lg border border-border bg-surface p-4 text-center">
          <p className="t-h2">Arena Match</p>
          <p className="t-mono mt-1 break-all text-fg-muted">{matchId}</p>
        </div>
      </main>
      <MatchDetailModal
        matchId={matchId}
        isOpen
        onClose={() => navigate("/")}
        region={region}
      />
    </div>
  );
};

export default MatchPage;
