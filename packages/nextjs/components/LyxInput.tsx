import React, { useMemo, useState } from "react";
import Image from "next/image";
import { toaster } from "./ui/toaster";
import { Button, Input } from "@chakra-ui/react";
import { useCryptoPrice } from "~~/hooks/useCryptoPrice";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function LyxInput({ value = "", onChange = () => {}, placeholder = "0", className = "" }: Props) {
  const {
    price: nativeCurrencyPrice,
    loading: isFetchingNativeCurrency,
    fetchPrice: fetchNativeCurrency,
  } = useCryptoPrice();

  const [nativeValue, setNativeValue] = useState(value);
  const [dollarValue, setDollarValue] = useState("");
  const [isDollar, setIsDollar] = useState(false);

  const handleInput = (input: string) => {
    if (input.trim() === "") {
      setNativeValue("");
      setDollarValue("");
      onChange("");
      return;
    }
    // Ensure only valid floating numbers are parsed
    const numericValue = input.replace(/[^0-9.]/g, ""); // Remove non-numeric characters except `.`
    if (!/^\d*\.?\d*$/.test(numericValue) || numericValue === "") return; // Ensure valid decimal format

    if (!nativeCurrencyPrice) {
      setNativeValue(numericValue);
      onChange(numericValue);
      return;
    }

    let newNativeValue: string;
    if (isDollar) {
      setDollarValue(numericValue);
      newNativeValue = (parseFloat(numericValue) / nativeCurrencyPrice).toString();
      setNativeValue(newNativeValue);
    } else {
      newNativeValue = numericValue;
      setNativeValue(numericValue);
      setDollarValue((parseFloat(numericValue) * nativeCurrencyPrice).toFixed(2));
    }

    onChange(newNativeValue);
  };

  const switchCurrency = () => {
    if (!nativeCurrencyPrice) {
      toaster.create({
        title: "Loading exchange rate",
        type: "warning",
      });

      if (!isFetchingNativeCurrency) {
        fetchNativeCurrency();
      }

      return;
    }

    setIsDollar(prev => !prev);
  };

  const displayValue = isDollar ? dollarValue : nativeValue;
  const displayConversion = isDollar ? nativeValue : dollarValue;

  const currencyToggle = useMemo(() => {
    return (
      <Button onClick={switchCurrency} className="transition-transform duration-200 ease-in-out hover:scale-110">
        {isDollar ? (
          <span className="text-sm text-green-500 transition-transform duration-200 ease-in-out hover:scale-110">
            $
          </span>
        ) : (
          <div className="relative w-4 aspect-square transition-transform duration-200 ease-in-out hover:scale-110">
            <Image src="/images/lukso_logo.png" alt="LYX" fill />
          </div>
        )}
      </Button>
    );
  }, [isDollar]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex items-center w-full border border-gray bg-base-200 rounded text-accent">
        {currencyToggle}
        <Input
          placeholder={placeholder}
          className="input input-ghost focus-within:border-transparent focus:outline-none focus:bg-transparent h-[3rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/70 text-base-content/70 focus:text-base-content/70"
          value={displayValue}
          onChange={e => handleInput(e.target.value)}
          required
        />
      </div>

      <strong
        className="text-xs text-center font-semibold italic text-gray-500"
        style={{
          opacity: nativeValue && dollarValue ? 1 : 0,
        }}
      >
        ~{!isDollar && "$"}
        {displayConversion} {isDollar && "LYX"}
      </strong>
    </div>
  );
}
