import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { AddressInfo } from "net";
import { connectToDatabase } from "./db.js";
import Multisig from "./models/Multisig.js";
import Transaction, { ITransaction } from "./models/Transaction.js";

dotenv.config();

connectToDatabase();

type Transaction = {
  // [TransactionData type from next app]. Didn't add it since not in use
  // and it should be updated when next type changes
  [key: string]: any;
};

const app = express();

const transactions: { [key: string]: Transaction } = {};

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/:key", async (req, res) => {
  const { key } = req.params;
  console.log("Get /", key);
  res.status(200).send(transactions[key] || {});
});

// Function to add a new multisig wallet
const addMultisig = async (address: string) => {
  const existingMultisig = await Multisig.findOne({ address });

  if (!existingMultisig) {
    await Multisig.create({ address });
    console.log("Multisig address created:", address);
  } else {
    console.log("Multisig address already exists.");
  }
};

// Function to add or update a transaction
const addTransaction = async (txData: ITransaction) => {
  const { multisigAddress, hash } = txData;

  // Ensure the multisig address exists
  const existingMultisig = await Multisig.findOne({ address: multisigAddress });
  if (!existingMultisig) {
    console.log("Multisig address does not exist. Create it first.");
    return;
  }

  // Check if a transaction with the same hash exists
  const existingTransaction = await Transaction.findOne({
    multisigAddress,
    hash,
  });

  if (existingTransaction) {
    // Update the existing transaction with new details
    await Transaction.updateOne({ multisigAddress, hash }, { $set: txData });
    console.log("Transaction updated for hash:", hash);
  } else {
    // Insert a new transaction if no matching hash is found
    await Transaction.create(txData);
    console.log("New transaction added for multisig:", multisigAddress);
  }
};

// app.post("/", async (req, res) => {
//   console.log("Post /", req.body);
//   res.send(req.body);
//   const key = `${req.body.address}_${req.body.chainId}`;
//   console.log("key:", key);
//   if (!transactions[key]) {
//     transactions[key] = {};
//   }
//   transactions[key][req.body.hash] = req.body;
//   console.log("transactions", transactions);
// });

app.post("/", async (req, res) => {
  console.log("Post /", req.body);
  await addMultisig(req.body.address);
  await addTransaction(req.body);
});

const PORT = process.env.PORT || 49832;
const server = app
  .listen(PORT, () => {
    console.log(
      "HTTP Listening on port:",
      (server.address() as AddressInfo).port
    );
  })
  .on("error", (error) => {
    console.error("Error occurred starting the server: ", error);
  });
