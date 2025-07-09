import type { JSX } from "react";
import { GiPlainDagger, GiDeathSkull, GiThreeFriends } from "react-icons/gi";

interface KdaStatProps {
  type: "kills" | "deaths" | "assists" | "kda";
  value: number;
}

const KdaStat = ({ type, value }: KdaStatProps) => {
  const iconSwitch = (): JSX.Element | undefined => {
    switch (type) {
      case "kills":
        return <GiPlainDagger />;
      case "deaths":
        return <GiDeathSkull />;
      case "assists":
        return <GiThreeFriends />;
      case "kda":
      default:
        return undefined;
    }
  };

  return (
    <div className="flex flex-row gap-[4px]">
      {iconSwitch()}
      <p className="text-[12px] font-normal">
        {type === "kda" ? "KDA: " : ""}
        {value}
      </p>
    </div>
  );
};

export default KdaStat;
