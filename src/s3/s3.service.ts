import * as path from 'path';
import * as fs from 'fs-extra';
import { S3 } from 'aws-sdk';
import { Injectable } from '@nestjs/common';

@Injectable()
export class S3Service {
  s3ClientFactory(config: S3.ClientConfiguration) {
    return new S3({
      ...config,
      signatureVersion: 'v4',
      s3ForcePathStyle: true,
    });
  }

  async uploadDirectory({
    s3Client,
    directory,
    bucket,
    prefix,
  }: {
    s3Client: S3;
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
          return s3Client
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
    s3Client,
    filepath,
    bucket,
    key,
  }: {
    s3Client: S3;
    filepath: string;
    bucket: string;
    key: string;
  }): Promise<S3.ManagedUpload.SendData> {
    return s3Client
      .upload({
        Key: key,
        Bucket: bucket,
        Body: fs.createReadStream(filepath),
      })
      .promise();
  }

  async listObjects(
    s3Client: S3,
    params: any,
    items: any[] = [],
  ): Promise<S3.ObjectList> {
    const res = await s3Client.listObjectsV2(params).promise();
    res.Contents.map((item) => items.push(item));

    if (res.NextContinuationToken) {
      params.ContinuationToken = res.NextContinuationToken;
      return this.listObjects(s3Client, params, items);
    }

    return items;
  }

  getObjectUrl(s3Client: S3, params: any): Promise<string> {
    return s3Client.getSignedUrlPromise('getObject', params);
  }
}
