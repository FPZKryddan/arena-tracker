import { Navigate, useNavigate, useParams } from "react-router-dom";
import AppHeader from "../components/appHeader";
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
    <div className="box-border flex h-dvh w-full flex-col gap-[20px] overflow-auto bg-bg p-[12px] text-fg md:gap-[28px] md:p-[24px]">
      <AppHeader />
      <main className="flex min-h-[280px] flex-1 items-center justify-center">
        <div className="w-full max-w-[520px] rounded-lg border border-border bg-surface p-[18px] text-center">
          <p className="text-[14px] font-bold">Arena Match</p>
          <p className="mt-[4px] break-all text-[11px] text-fg-muted">
            {matchId}
          </p>
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
