import * as path from 'path';
import * as fs from 'fs-extra';
import { Endpoint, S3 } from 'aws-sdk';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  s3Client: S3;
  constructor(private configService: ConfigService) {
    this.s3Client = new S3({
      endpoint: new Endpoint(this.configService.get('S3_DEFAULT_ENDPOINT')),
      credentials: {
        accessKeyId: this.configService.get('S3_DEFAULT_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('S3_DEFAULT_SECRET_ACCESS_KEY'),
      },
      signatureVersion: 'v4',
      s3ForcePathStyle: true,
    });
  }

  // s3ClientFactory(config: S3.ClientConfiguration) {
  //   return new S3({
  //     ...config,
  //     signatureVersion: 'v4',
  //     s3ForcePathStyle: true,
  //   });
  // }

  parseS3Uri(s3Uri: string): { bucket: string; key: string } {
    const [, , bucket, ...keyParts] = s3Uri.split('/');
    const key = keyParts.join('/');
    return { bucket, key };
  }

  async uploadDirectory({
    directory,
    bucket,
    prefix,
  }: {
    directory: string;
    bucket: string;
    prefix: string;
  }): Promise<void> {
    try {
      console.info('uploading directory');
      console.info(`reading files from ${directory}`);
      const files = await fs.readdir(directory);
      console.info(`uploading ${files.length} files`);

      await Promise.all(
        files.map((f) => {
          const key = `${prefix}/${path.basename(f)}`;
          return this.s3Client
            .upload({
              Key: key,
              Bucket: bucket,
              Body: fs.createReadStream(`${directory}/${f}`),
            })
            .promise();
        }),
      );
    } catch (error) {
      console.error(error);
    }
  }

  async uploadFile({
    filepath,
    bucket,
    key,
  }: {
    filepath: string;
    bucket: string;
    key: string;
  }): Promise<S3.ManagedUpload.SendData> {
    return this.s3Client
      .upload({
        Key: key,
        Bucket: bucket,
        Body: fs.createReadStream(filepath),
      })
      .promise();
  }

  async listObjects(params: any, items: any[] = []): Promise<S3.ObjectList> {
    const res = await this.s3Client.listObjectsV2(params).promise();
    res.Contents.map((item) => items.push(item));

    if (res.NextContinuationToken) {
      params.ContinuationToken = res.NextContinuationToken;
      return this.listObjects(params, items);
    }

    return items;
  }

  getObjectUrl({
    Bucket,
    Key,
  }: {
    Bucket: string;
    Key: string;
  }): Promise<string> {
    return this.s3Client.getSignedUrlPromise('getObject', { Bucket, Key });
  }
}