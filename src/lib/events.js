const events = require('events');
const AWS = require('aws-sdk');

class Emitter extends events.EventEmitter {
  constructor({ videoId, snsTopicArn, region }) {
    super();
    this.videoId = videoId;
    this.snsTopicArn = snsTopicArn;
    this.sns = new AWS.SNS({ region });
  }

  async emit(type, msg) {
    console.log(type, msg);
    await this.sns
      .publish({ TopicArn: this.snsTopicArn, Message: msg })
      .promise();
  }
}

module.exports = Emitter;
