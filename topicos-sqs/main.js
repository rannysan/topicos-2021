var AWS = require('aws-sdk');

AWS.config.loadFromPath('./config.json');

var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

var queueURL = "https://sqs.us-east-1.amazonaws.com/937261368102/test-message";

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Digite uma mensagem ", function (text) {
  var params = {
    DelaySeconds: 10,
    MessageAttributes: {
      "Title": {
        DataType: "String",
        StringValue: "Topicos - SQS"
      },
      "Author": {
        DataType: "String",
        StringValue: "Raniel Santos"
      },
      "WeeksOn": {
        DataType: "Number",
        StringValue: "6"
      }
    },
    MessageBody: text,

    QueueUrl: queueURL
  };

  sqs.sendMessage(params, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.MessageId);
    }
  });

  //receive message
  rl.question("Deseja receber e deletar a mensagem da fila? S (sim)/ N (não) ", function (op) {
    if (op.toLowerCase() === 's') {
      var params = {
        AttributeNames: [
          "SentTimestamp"
        ],
        MaxNumberOfMessages: 10,
        MessageAttributeNames: [
          "All"
        ],
        QueueUrl: queueURL,
        VisibilityTimeout: 20,
        WaitTimeSeconds: 0
      };

      sqs.receiveMessage(params, function (err, data) {
        if (err) {
          console.log("Receive Error", err);
        } else if (data.Messages) {
          console.log(data.Messages); var deleteParams = {
            QueueUrl: queueURL,
            ReceiptHandle: data.Messages[0].ReceiptHandle
          };
          sqs.deleteMessage(deleteParams, function (err, data) {
            if (err) {
              console.log("Delete Error", err);
            } else {
              console.log("Message Deleted", data);
            }
          });
        }
      });

      rl.close();
    } else {

      rl.close();
    }
  });
});

