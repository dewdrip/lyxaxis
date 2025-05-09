import { QRCodeSVG } from "qrcode.react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

interface ReceiveModalProps {
  address: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiveModal = ({ address, isOpen, onClose }: ReceiveModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-base-100 p-6 rounded-xl w-[400px] max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Receive</h3>
          <button onClick={onClose} className="hover:text-error">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-lg">
            <QRCodeSVG value={address} size={192} level="H" marginSize={1} className="w-48 h-48" />
          </div>

          <Address address={address} format="long" disableBlockie={true} />
        </div>
      </div>
    </div>
  );
};
