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
          className={`select-none rounded-md border px-10 py-1 text-center text-base font-semibold hover:cursor-pointer ${
            isOpen ? "bg-accent text-accent-fg" : "bg-surface-elevated text-fg"
          }`}
        >
          {label}
        </p>
        {isOpen && (
          <ul className="absolute z-11 mt-1 w-full rounded-md border border-border bg-surface text-fg">
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
