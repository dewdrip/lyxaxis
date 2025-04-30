import { Abi, decodeFunctionData } from "viem";
import { TransactionData } from "~~/app/transfer/[id]/page";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useCreateWallet, useDecodedProfileMetadata } from "~~/hooks/contract/useCreateWallet";
import LspABI from "~~/utils/abis/LspABI.json";

export const PreveiwProfileModal = ({
  txnData,
  tx,
}: {
  txnData: {
    args: readonly unknown[] | undefined;
    functionName: string;
  };
  tx: TransactionData;
}) => {
  const {
    data: profile,
    loading: profileLoading,
    error,
  } = useDecodedProfileMetadata(txnData.args?.[1] as `0x${string}`);

  console.log("data", profile);

  const getImageUrl = (ipfsUrl: string) => ipfsUrl.replace("ipfs://", "https://api.universalprofile.cloud/ipfs/");

  const renderBackgroundImage = () => {
    if (profileLoading || !profile)
      return <div className="bg-base-200 w-full h-full skeleton absolute rounded-t-xl"></div>;
    if (profile.backgroundImage && profile.backgroundImage.length > 0) {
      return (
        <img
          src={getImageUrl(profile.backgroundImage[0].url)}
          alt="Profile background"
          className="object-cover w-full h-full absolute rounded-t-xl"
        />
      );
    }
    return <div className="bg-base-200 w-full h-full absolute rounded-t-xl"></div>;
  };

  const renderProfileImage = () => {
    if (profileLoading || !profile)
      return (
        <div className="absolute border-[3px] skeleton border-base-300 w-24 h-24 object-cover right-8 -bottom-12 rounded-full "></div>
      );
    if (profile.profileImage && profile.profileImage.length > 0) {
      return (
        <img
          src={getImageUrl(profile.profileImage[0].url)}
          alt="Profile"
          className="absolute border-[3px] border-base-300 w-24 h-24 object-cover right-8 -bottom-12 rounded-full"
        />
      );
    }
    return (
      <div className="absolute border-[3px] bg-base-100 border-base-300 w-24 h-24 object-cover right-8 -bottom-12 rounded-full"></div>
    );
  };

  return (
    <div className="modal-box w-[400px] h-[500px] mx-auto">
      <div className="flex flex-col w-full">
        <div className="relative w-full h-24">
          {renderBackgroundImage()}
          {renderProfileImage()}
        </div>

        <div className="flex gap-2">
          <div className="font-bold">Function Signature:</div>
          {txnData.functionName || "transferFunds"}
        </div>

        <div className="mt-4">
          <div className="font-bold">Sig hash</div>{" "}
          <div className="flex gap-1 mt-2">
            <BlockieAvatar size={20} address={tx.hash} /> {tx.hash.slice(0, 7)}
          </div>
        </div>
        <div className="modal-action">
          <label htmlFor={`label-${tx.hash}`} className="btn btn-sm">
            Close!
          </label>
        </div>
      </div>
    </div>
  );
};
