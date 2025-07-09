interface ProfileHeaderProps {
  name?: string;
  percentProgress?: number;
  iconId?: number;
}

const ProfileHeader = ({ name, percentProgress, iconId }: ProfileHeaderProps) => {
  return (
    <div className="flex flex-row gap-[8px] mt-[24px]">
        {iconId ?
            <img className="bg-gray-200 w-[55px] h-[55px] rounded-[25px]" src={`https://ddragon.leagueoflegends.com/cdn/15.13.1/img/profileicon/${iconId}.png`} ></img>
            : <img className="bg-gray-200 w-[55px] h-[55px] rounded-[25px]" src={`https://ddragon.leagueoflegends.com/cdn/15.13.1/img/profileicon/1.png`} ></img>
        }
      <div className="flex flex-col items-start justify-center">
        <h1 className="text-[#757575] text-[24px] leading-[44px] font-medium stroke-2 stroke-black text-left">
          {name && name !== undefined ? name : 'RiotName#TAG'}
        </h1>
        {percentProgress ? (
          <p className="text-[#49CA5C] text-left self-start">
            {percentProgress}% to <span className="text-[#F6F600]">Arena Mastery</span>
          </p>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
