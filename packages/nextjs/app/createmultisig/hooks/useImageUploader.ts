import { useEffect, useState } from "react";
import axios from "axios";
import { Buffer } from "buffer";
import { ethers } from "ethers";
import { notification } from "~~/utils/scaffold-eth";

const pinataEndpoint = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_API_KEY = "7ddc8c56c25211161baf";
const PINATA_API_SECRET = "6fed59a71efcee9b9148ff9c9415faf570093b82e2b42b0b0a2f876587f47796";

export type ImageType = {
  name: string;
  uri: string;
  type: string;
  file: File;
};

interface UseImageUploaderConfig {
  image?: ImageType;
  enabled?: boolean;
  onUpload?: (progress: number) => void;
  onError?: (error: any) => void;
}

interface ImageData {
  ipfsHash: string;
  bufferHash: string;
  size: number;
  timestamp: string;
}

const getBase64FromFile = (file: File): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // This reads it as base64 Data URL

    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const base64ToUint8Array = (base64: string) => {
  const binaryString = atob(base64); // decode base64 to binary string
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

/**
 * @notice uploads image to IPFS via Pinata(https://pinata.cloud)
 * @param config.image - ImageType - name, type, uri
 * @param config.enabled - if true, image is uploaded automatically
 * @param config.onUpload - upload progress handler function
 * @param config.onError - error handler function
 */
export function useImageUploader({ image, enabled, onUpload, onError }: UseImageUploaderConfig) {
  const [data, setData] = useState<ImageData>();
  const [isUploading, setIsUploading] = useState(enabled || false);
  const [progress, setProgress] = useState<number>();
  const [error, setError] = useState<any>();

  // upload image to ipfs via Pinata
  const upload = async (image: ImageType): Promise<ImageData | undefined> => {
    try {
      setIsUploading(true);

      const base64Image = await getBase64FromFile(image.file);

      const rawBase64 = base64Image?.toString().split(",")[1];

      if (!rawBase64) {
        throw new Error("Failed to process base64 image data");
      }
      // const imageBuffer = Buffer.from(rawBase64, "base64");

      const imageBuffer = base64ToUint8Array(rawBase64);

      const formData = new FormData();
      formData.append("file", new Blob([imageBuffer], { type: image.type }), image.name);

      const pinataOptions = JSON.stringify({
        cidVersion: 1,
      });

      formData.append("pinataOptions", pinataOptions);

      const { data } = await axios.post(pinataEndpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
        onUploadProgress: ({ loaded, total }) => {
          // track upload progress
          const progress = (loaded * 100) / (total || 1);

          setProgress(progress);

          if (onUpload) {
            onUpload(progress);
          }
        },
      });

      if (error) {
        setError(null);
      }

      const result = {
        ipfsHash: data.IpfsHash,
        bufferHash: ethers.keccak256(imageBuffer),
        size: data.PinSize,
        timestamp: data.Timestamp,
      };
      setData(result);
      return result;
    } catch (error) {
      setError(error);

      if (onError) {
        onError(error);
      }
      notification.error("Image Upload Failed. Please check your network connection and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (enabled !== false && image) {
      upload(image);
    }
  }, [enabled, image]);

  return {
    data,
    isUploading,
    progress,
    error,
    upload,
  };
}
