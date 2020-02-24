const AWS = require('aws-sdk');

class Logger {
  eventPublishingArn;
  sns;

  config({ eventPublishingArn, region }) {
    this.eventPublishingArn = eventPublishingArn;
    this.sns = new AWS.SNS({ region });
    return this;
  }

  async log(msg, shouldPublish) {
    if (shouldPublish) {
      await this.sns
        .publish({
          TopicArn: this.eventPublishingArn,
          Message: JSON.stringify(msg),
        })
        .promise();
    }

    console.log(msg);
  }
}

module.exports = new Logger();
