type ChampionStageProgressProps = {
    stage: number;
}

const ChampionStageProgress = ({ stage }: ChampionStageProgressProps) => {

    return (
        <div className="flex flex-row h-full gap-0.5 -skew-x-16">
            <div className={`rounded-l-2xl h-full w-auto aspect-square 
                ${stage > 0 ? 'bg-amber-400' : 'bg-amber-50'}`}></div>
            <div className={`h-full w-auto aspect-square   
                ${stage > 1 ? 'bg-amber-400' : 'bg-amber-50'}`}></div>
            <div className={`rounded-r-2xl h-full w-auto aspect-square 
                ${stage > 2 ? 'bg-amber-400' : 'bg-amber-50'}`}></div>

        </div>
    );
}

export default ChampionStageProgress;