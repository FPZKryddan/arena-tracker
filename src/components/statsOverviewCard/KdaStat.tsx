import type { JSX } from "react";
import { GiPlainDagger, GiDeathSkull, GiThreeFriends } from "react-icons/gi";
import useFormatter from "../../hooks/useFormatter";

interface KdaStatProps {
  type: "kills" | "deaths" | "assists" | "kda";
  value: number | string;
}

const KdaStat = ({ type, value }: KdaStatProps) => {
  const { formatNumber } = useFormatter();

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
    <div className="flex flex-row gap-1">
      {iconSwitch()}
      <p className="t-stat">
        {type === "kda" ? "KDA: " : ""}
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
    </div>
  );
};

export default KdaStat;
