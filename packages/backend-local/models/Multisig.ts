import mongoose, { Document, Schema, Model } from "mongoose";

// Define an interface for the multisig document
interface IMultisig extends Document {
  address: string;
}

// Define the schema
const MultisigSchema: Schema<IMultisig> = new Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true, // Ensures no duplicate multisig addresses
      index: true, // Optimizes lookup performance
    },
  },
  { timestamps: true }
);

// Define the model
const Multisig: Model<IMultisig> = mongoose.model<IMultisig>(
  "Multisig",
  MultisigSchema
);

export default Multisig;
