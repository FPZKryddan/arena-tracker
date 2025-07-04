import type React from "react";
import { MdClose   } from "react-icons/md";

interface ModalProps extends React.PropsWithChildren {
  isOpen: boolean;
  closeCallback: () => void;
}

const Modal = ({ isOpen, closeCallback, children }: ModalProps) => (
  isOpen 
    ? <div className="absolute inset-0 bg-black/70 backdrop-blur-xl z-10 flex items-center justify-center">
        <div className="relative py-8 px-8 min-w-48 bg-stone-400 rounded-md flex flex-col">
          <button className="absolute top-2 right-2 hover:text-white hover:cursor-pointer" onClick={closeCallback}><MdClose className="h-6 w-6"/></button>
          {children}
        </div>
      </div>
    : <></>
);

export default Modal;
