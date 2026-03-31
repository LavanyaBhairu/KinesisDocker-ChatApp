import AWS from "aws-sdk";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import Message from "./message.model.js";
import Conversation from "./models/conversation.model.js";
dotenv.config();
await connectDB();

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const kinesis = new AWS.Kinesis();

// Function to consume a single shard
async function consumeShard(streamName, shardId) {
  try {
    const iteratorData = await kinesis.getShardIterator({
      StreamName: streamName,
      ShardId: shardId,
      ShardIteratorType: "LATEST",
    }).promise();

    let shardIterator = iteratorData.ShardIterator;

    console.log(`Listening to shard: ${shardId}`);

    while (true) {
      try {
        const data = await kinesis.getRecords({
          ShardIterator: shardIterator,
          Limit: 10,
        }).promise();

        shardIterator = data.NextShardIterator;

        console.log(`[${shardId}] Records fetched: ${data.Records.length}`);

        if (data.Records.length > 0) {
          data.Records.forEach(async (record) => {
            try {
              const messageString = Buffer.from(record.Data, "base64").toString();
              const parsedData = JSON.parse(messageString);

              console.log(`[${shardId}] Received:`, parsedData);

              const newMessage = await Message.create({
                senderId: parsedData.senderId,
                receiverId: parsedData.receiverId,
                message: parsedData.message,
              });

              console.log("Saved Message:", newMessage);

              // 🔥 HANDLE CONVERSATION
              let conversation = await Conversation.findOne({
                participants: {
                  $all: [parsedData.senderId, parsedData.receiverId],
                },
              });

              if (!conversation) {
                conversation = await Conversation.create({
                  participants: [parsedData.senderId, parsedData.receiverId],
                });
              }

              conversation.messages.push(newMessage._id);
              await conversation.save();

              console.log("Updated Conversation:", conversation._id);
              // 🔥 SAVE TO DB
             // await Message.create(parsedData);

            } catch (error) {
              console.error("Error processing record:", error);
            }
          });
        }

      } catch (err) {
        console.error(`Error reading shard ${shardId}:`, err.message);
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

  } catch (err) {
    console.error(`Error initializing shard ${shardId}:`, err.message);
  }
}

// Main function
async function startConsumer() {
  const streamName = "chat-stream";

  try {
    const stream = await kinesis.describeStream({
      StreamName: streamName,
    }).promise();

    const shards = stream.StreamDescription.Shards;

    console.log(`Found ${shards.length} shard(s)`);

    for (const shard of shards) {
      consumeShard(streamName, shard.ShardId);
    }

  } catch (err) {
    console.error("Error starting consumer:", err.message);
  }
}

startConsumer();