interface SelectorItemProps {
  label: string;
  onSelect: (value: string) => void;
}

const SelectorItem = ({ label, onSelect }: SelectorItemProps) => {
  return (
    <li
      className="w-full px-2 py-1 text-fg hover:bg-surface-hover hover:cursor-pointer"
      onClick={() => onSelect(label)}
    >
      {label}
    </li>
  );
};

export default SelectorItem;
