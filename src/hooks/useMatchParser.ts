import type { championData, ParticipantDto, MatchDto } from "../types";

function useMatchParser() {
  const GetParticipantIdForPlayer = (
    matchData: MatchDto,
    player: string
  ): number | null => {
    const participants: ParticipantDto[] = matchData.info.participants;

    let foundId: number | null = null;
    participants.forEach((participant) => {
      if (participant.puuid === player) {
        foundId = participant.participantId - 1;
        return;
      }
    });

    return foundId;
  };

  const GetPlayersProgressOnChampionFromMatch = (
    matchData: MatchDto,
    participantId: number
  ): championData => {
    const player = matchData.info.participants[participantId];
    const name = player.championName;
    let stage: number = 1;

    if (player.placement === 1) {
      stage = 3;
    } else if (player.placement >= 4) {
      stage = 2;
    }

    return {
      name,
      stage,
      id: "",
    };
  };

  const ComparePlayedGameToSavedData = (
    played: championData,
    savedData: championData[]
  ): { data: championData[], didUpdate: boolean } => {
    const newData: championData[] = [...savedData];
    let updated = false;
    newData.forEach((champion) => {
      if (
        played.name.toLocaleLowerCase() === champion.name.toLocaleLowerCase()
      ) {
        if (played.stage > champion.stage) {
          champion.stage = played.stage;
          updated = true;
          return;
        }
      }
    });
    return { data: newData, didUpdate: updated };
  };

  return {
    GetParticipantIdForPlayer,
    GetPlayersProgressOnChampionFromMatch,
    ComparePlayedGameToSavedData
  }
}

export default useMatchParser;
