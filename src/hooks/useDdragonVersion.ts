import { useContext } from "react";
import { DdragonVersionContext } from "../contexts/DdragonVersionContext";

const useDdragonVersion = (): string => useContext(DdragonVersionContext);

export default useDdragonVersion;
