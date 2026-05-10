import type React from "react";
import { MdClose   } from "react-icons/md";

interface ModalProps extends React.PropsWithChildren {
  isOpen: boolean;
  canClose: boolean;
  closeCallback: () => void;
}

const Modal = ({ isOpen, canClose, closeCallback, children }: ModalProps) => (
  isOpen 
    ? <div className="absolute inset-0 z-10 flex items-center justify-center bg-overlay">
        <div className="relative flex min-w-48 flex-col rounded-md border border-border bg-surface px-8 py-8 text-fg">
          <button className={`absolute top-2 right-2 text-fg-muted hover:text-fg hover:cursor-pointer ${canClose ? 'block' : 'hidden'}`} onClick={closeCallback}><MdClose className="h-6 w-6"/></button>
          {children}
        </div>
      </div>
    : <></>
);

export default Modal;
