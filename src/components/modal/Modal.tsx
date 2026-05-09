import type React from "react";
import { MdClose   } from "react-icons/md";

interface ModalProps extends React.PropsWithChildren {
  isOpen: boolean;
  canClose: boolean;
  closeCallback: () => void;
}

const Modal = ({ isOpen, canClose, closeCallback, children }: ModalProps) => (
  isOpen 
    ? <div className="absolute inset-0 bg-overlay backdrop-blur-xl z-10 flex items-center justify-center">
        <div className="relative py-8 px-8 min-w-48 bg-surface-elevated text-fg rounded-md flex flex-col border border-border">
          <button className={`absolute top-2 right-2 text-fg-muted hover:text-fg hover:cursor-pointer ${canClose ? 'block' : 'hidden'}`} onClick={closeCallback}><MdClose className="h-6 w-6"/></button>
          {children}
        </div>
      </div>
    : <></>
);

export default Modal;
