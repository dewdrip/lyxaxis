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

// const transactions: { [key: string]: Transaction } = {};

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/:key", async (req, res) => {
  try {
    const { key: address } = req.params;

    // Fetch transactions filtered by address
    const transactions = await Transaction.find({ address: address });

    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "ITEM_NOT_FOUND" });
    }

    return res.status(200).json({
      status: "success",
      message: "Data retrieved successfully",
      transactions,
    });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve data",
      error: err.message,
    });
  }
});

const addTransaction = async (txData: ITransaction) => {
  const { address, hash } = txData;

  // Ensure the multisig entry exists (create if not)
  const existingMultisig = await Multisig.findOneAndUpdate(
    { address },
    { $setOnInsert: { address } },
    { upsert: true, new: true }
  );

  // Upsert transaction: update if exists, insert if not
  const transaction = await Transaction.findOneAndUpdate(
    { address, hash },
    { $set: txData },
    { upsert: true, new: true }
  );

  return transaction;
};

// Express route to add a transaction
app.post("/", async (req, res) => {
  console.log("POST /", req.body);

  try {
    const response = await addTransaction(req.body);

    if (!response) {
      return res.status(500).json({ message: "ITEM_NOT_FOUND" });
    }

    return res
      .status(200)
      .json({ message: "Transaction added successfully", data: response });
  } catch (error) {
    console.error("Transaction Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update data",
      error: error.message,
    });
  }
});

// app.delete("/", async (req, res) => {
//   console.log("DELETE /", req.body);

//   try {
//     // Delete all transactions
//     const response = await Transaction.deleteMany({});

//     if (!response) {
//       return res.status(500).json({ message: "ITEM_NOT_FOUND" });
//     }

//     return res
//       .status(200)
//       .json({
//         message: "All transactions deleted successfully",
//         data: response,
//       });
//   } catch (error) {
//     console.error("Transaction Error:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to delete data",
//       error: error.message,
//     });
//   }
// });

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
