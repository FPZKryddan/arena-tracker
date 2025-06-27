interface SelectorItemProps {
  label: string;
  onSelect: (value: string) => void;
}

const SelectorItem = ({ label, onSelect }: SelectorItemProps) => {
  return (
    <li
      className="w-full px-2 py-1 text-white hover:bg-stone-400 hover:cursor-pointer"
      onClick={() => onSelect(label)}
    >
      {label}
    </li>
  );
};

export default SelectorItem;
