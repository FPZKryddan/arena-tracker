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
      <div className="relative w-full " onClick={toggleCallBack}>
        <p
          className={`px-6 w-full font-semibold text-center hover:cursor-pointer rounded-full text-md select-none ${
            isOpen ? "bg-white text-black" : "bg-stone-700 text-white"
          }`}
        >
          {label}
        </p>
        {isOpen && (
          <ul className="absolute bg-stone-500 z-11 w-full mt-1 rounded-md py-2 drop-shadow-md">
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
