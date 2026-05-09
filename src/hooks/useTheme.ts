import { ThemeContext } from "../contexts/ThemeContext";
import useContextIfDefined from "./useContextIfDefined";

const useTheme = () => useContextIfDefined(ThemeContext);

export default useTheme;
