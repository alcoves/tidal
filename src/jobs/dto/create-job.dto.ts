enum JOB_TYPES {
	TRANSCRIBE = "transcribe",
}

enum JOB_MODES {
	SYNC = "sync",
	BATCH = "batch",
}

export class CreateJobDto {
	mode: JOB_MODES = JOB_MODES.SYNC;
	type: JOB_TYPES;
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
