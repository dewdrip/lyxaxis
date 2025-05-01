import { Abi, decodeFunctionData } from "viem";
import { TransactionData } from "~~/app/transfer/[id]/page";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useCreateWallet, useDecodedProfileMetadata } from "~~/hooks/contract/useCreateWallet";
import { ProfilePayload } from "~~/hooks/useProfileMetadata";
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
  } = useDecodedProfileMetadata(txnData.args?.[1] as `0x${string}`) as {
    data: ProfilePayload;
    loading: boolean;
    error: any;
  };

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
    <div className="modal-box w-[400px] h-[520px] overflow-y-scroll mx-auto">
      <div className="flex flex-col w-full h-full">
        <div className="relative w-full h-24">
          {renderBackgroundImage()}
          {renderProfileImage()}
        </div>

        <div className=" flex flex-col gap-y-2 mt-6">
          <div>
            <div className="w-24 text-sm">Name:</div>
            <div className="text-base font-semibold">{profile?.name || "Loading..."}</div>
          </div>

          <div>
            <div className="w-24 text-sm">Description:</div>
            <div className="text-base">{profile?.description || "Loading..."}</div>
          </div>

          <div>
            <div className="w-24 text-sm">Tags:</div>
            <div className="text-base flex gap-x-1">
              {profile?.tags.map((tag, index) => <span key={index}>{tag} | </span>) || "Loading..."}
            </div>
          </div>

          <div>
            <div className="w-24 text-sm">Links:</div>
            <div className="text-base flex flex-col gap-y-1">
              {profile?.links.map(({ id, title, url }, index) => (
                <div className="flex gap-x-2" key={index}>
                  <span className="font-semibold text-sm p-1">{title}: </span>{" "}
                  <input className="text-sm p-1 w-[200px] " disabled={true} value={url} />
                </div>
              )) || "Loading..."}
            </div>
          </div>
        </div>

        <div className="mt-2">
          <div className="font-semibold">Function Signature: {txnData.functionName || "transferFunds"}</div>
          <div className="flex gap-x-2">
            <div className="font-semibold">Sig hash: </div>{" "}
            <div className="flex gap-1">
              <BlockieAvatar size={20} address={tx.hash} /> {tx.hash.slice(0, 7)}
            </div>
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
