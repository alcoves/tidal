export class TranscribeOneDto {
	input: {
		url: string;
	};
	output: {
		s3: {
			bucket: string;
			prefix: string;
			endpoint: string;
			accessKeyId: string;
			secretAccessKey: string;
		};
	};
}
