import SelectorItem from "./SelectorItem";

interface SelectorProps {
  label: string;
  items: string[];
  isOpen: boolean;
  toggleCallBack: () => void;
  closeCallBack: () => void;
  selectCallBack: (value: string) => void;
}

const Selector = ({
  label,
  items,
  isOpen,
  toggleCallBack,
  selectCallBack,
}: SelectorProps) => {
  return (
    <>
      {/* {isOpen &&
        <div className="absolute inset-0 z-10" onClick={closeCallBack}></div>
      } */}
      <div className="relative" onClick={toggleCallBack}>
        <p
          className={`px-10 py-1 font-semibold text-center hover:cursor-pointer rounded-full text-md select-none ${
            isOpen ? "bg-accent text-accent-fg" : "bg-surface-elevated text-fg"
          }`}
        >
          {label}
        </p>
        {isOpen && (
          <ul className="absolute bg-surface-elevated text-fg border border-border z-11 w-full mt-1 rounded-md py-2 drop-shadow-md">
            {items.map((item) => (
              <SelectorItem
                key={item}
                label={item}
                onSelect={selectCallBack}
              ></SelectorItem>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default Selector;
