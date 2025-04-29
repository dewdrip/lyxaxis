import { Dispatch, SetStateAction, useState } from "react";
import { BackButton } from "./BackButton";
import { ImageUploader } from "./imageUploader";
import { useIsMounted } from "usehooks-ts";
import { useWalletClient } from "wagmi";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { LinkInput } from "~~/components/LinkInput";
import { TagInput } from "~~/components/TagInput";
import { InputBase } from "~~/components/scaffold-eth";
import { UploadedImageData } from "~~/hooks/useProfileMetadata";

interface Link {
  id: string;
  title: string;
  url: string;
}

export const OptionalForm = ({
  profileImage,
  backgroundImage,
  description,
  tags,
  links,
  setDescription,
  setTags,
  setLinks,
  setProfileImage,
  setBackgroundImage,
  setBackgroundImageFile,
  setProfileImageFile,
  handleCreate,
  isCreateWalletLoading,

  pages,
  setPages,
}: {
  handleCreate: () => Promise<void>;
  profileImage: UploadedImageData[];
  backgroundImage: UploadedImageData[];
  description: string;
  tags: string[];
  links: Link[];
  setProfileImage: Dispatch<SetStateAction<UploadedImageData[]>>;
  setBackgroundImage: Dispatch<SetStateAction<UploadedImageData[]>>;
  setDescription: Dispatch<SetStateAction<string>>;
  setTags: Dispatch<SetStateAction<string[]>>;
  setLinks: Dispatch<SetStateAction<Link[]>>;
  isCreateWalletLoading: boolean;
  setBackgroundImageFile: Dispatch<SetStateAction<File | null>>;
  setProfileImageFile: Dispatch<SetStateAction<File | null>>;
  setPages: Dispatch<SetStateAction<number>>;
  pages: number;
}) => {
  const { data: walletClient } = useWalletClient();

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const addLink = () => {
    setLinks([...links, { id: Date.now().toString(), title: "", url: "" }]);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const setLinkTitle = (id: string, title: string) => {
    setLinks(links.map(link => (link.id === id ? { ...link, title } : link)));
  };

  const setLinkUrl = (id: string, url: string) => {
    setLinks(links.map(link => (link.id === id ? { ...link, url } : link)));
  };

  return useIsMounted() ? (
    <div className="flex flex-col flex-1 items-center gap-8 px-4">
      <div className="flex flex-col flex-grow w-full max-w-lg">
        <div className="mt-5 mb-2">
          <BackButton action={() => setPages(0)} />
          <div className="text-left text-2xl mt-2">Give your Multisig a face</div>
          <div className="text-xs max-w-[350px]">
            Add profile image and other meta data to your multisig. These details are optional and can be updated later
            by creating a proposal
          </div>
        </div>

        <div className="flex flex-col gap-y-6 bg-base-200 border border-gray rounded-xl w-full">
          <ImageUploader
            setFieldValue={async (field: string, value: string): Promise<void> => {
              console.log(field, value);
            }}
            setBackgroundImage={setBackgroundImage}
            setProfileImage={setProfileImage}
            setBackgroundImageFile={setBackgroundImageFile}
            setProfileImageFile={setProfileImageFile}
          />
          <div className="px-2 flex flex-col gap-y-6 pb-6">
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-4">
                <label className="label p-0">
                  <span className="label-text">Add Multisig Description</span>
                </label>
                <InputBase
                  value={description}
                  placeholder={"Brief Description"}
                  onChange={(value: string) => setDescription(value)}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-y-4">
              <label className="label p-0">
                <span className="label-text">Tags</span>
              </label>
              <TagInput onAdd={addTag} onDelete={removeTag} tags={tags} />
            </div>

            {/* Links */}
            <div className="flex flex-col gap-y-4">
              <div className="flex justify-between items-center">
                <label className="label p-0">
                  <span className="label-text">Links</span>
                </label>
                <button onClick={addLink} className="btn btn-primary btn-sm h-[2.5rem] rounded-xl">
                  <PlusCircleIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {links.map(link => (
                  <LinkInput
                    key={link.id}
                    title={link.title}
                    url={link.url}
                    onCancel={() => removeLink(link.id)}
                    onChangeTitle={title => setLinkTitle(link.id, title)}
                    onChangeUrl={url => setLinkUrl(link.id, url)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-2 flex justify-between px-6">
              <button
                className="w-fit px-12 btn btn-base-100 border-primary btn-sm h-[2.5rem] rounded-xl hover:border-primary"
                disabled={!walletClient || isCreateWalletLoading}
                onClick={handleCreate}
              >
                Skip
              </button>
              <button
                className="w-fit px-12 btn btn-primary btn-sm h-[2.5rem] rounded-xl"
                disabled={!walletClient || isCreateWalletLoading}
                onClick={handleCreate}
              >
                {isCreateWalletLoading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
