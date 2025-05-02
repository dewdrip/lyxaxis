import mongoose, { Document, Schema, Model } from "mongoose";

// Define an interface for a single transaction
export interface ITransaction extends Document {
  chainId: string; // bigint converted to string
  address: string;
  nonce: string; // bigint converted to string
  to: string;
  amount: string; // bigint converted to string
  data: string;
  hash: string;
  signatures: string[];
  signers: string[];
  requiredApprovals: string; // bigint converted to string
  isExecuted: boolean;
}

// Define the schema
const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    address: {
      type: String,
      required: true,
      ref: "Multisig",
      index: true,
    },
    chainId: String,
    nonce: String,
    to: String,
    amount: String,
    data: String,
    hash: String,
    signatures: [String],
    signers: [String],
    requiredApprovals: String,
    isExecuted: Boolean,
  },
  { timestamps: true }
);

// Define the model
const Transaction: Model<ITransaction> = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);

export default Transaction;
