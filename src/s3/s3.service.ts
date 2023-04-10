import { Injectable } from "@nestjs/common";
import { S3 } from "aws-sdk";
import * as fs from "fs-extra";
import * as path from "path";

@Injectable()
export class S3Service {
	s3ClientFactory(config: S3.ClientConfiguration) {
		return new S3({ ...config });
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
		const files = await fs.readdir(directory);
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
	}
}
