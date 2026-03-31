import AWS from "aws-sdk";

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const kinesis = new AWS.Kinesis();
const STREAM_NAME = process.env.KINESIS_STREAM_NAME;

export const sendMessageToKinesis = async (messageData) => {
  const params = {
    Data: JSON.stringify(messageData),
    PartitionKey: messageData.roomId,
    StreamName: STREAM_NAME,
  };

  try {
    const result = await kinesis.putRecord(params).promise();
    console.log("Message sent:", result);
    return result;
  } catch (error) {
    console.error("Kinesis error:", error);
    throw error;
  }
};