import mongoose, { Document, Schema, Model } from "mongoose";

// Define an interface for the document structure
interface ITransaction extends Document {
  multisigAddress?: string;
  transactionData?: string;
}

// Define the schema
const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    multisigAddress: {
      type: String,
    },
    transactionData: {
      type: String,
    },
  },
  { timestamps: true } // Enables createdAt and updatedAt timestamps
);

// Define the model
const Transaction: Model<ITransaction> = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);

export default Transaction;
