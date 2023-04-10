import { S3Service } from "../s3/s3.service";
import { TranscribeOneDto } from "./dto/transcribe-one.dto";
import { Injectable } from "@nestjs/common";
import * as fs from "fs-extra";
import * as shell from "shelljs";

@Injectable()
export class TranscribeService {
	constructor(private readonly s3Service: S3Service) {}

	transcribeOneBatch() {
		return "This action transcribes one batch";
	}

	transcribeFile(): Promise<string> {
		return new Promise((resolve, reject) => {
			const child = shell.exec("", { async: true });
			child.stdout.on("data", function (data) {
				console.log(data);
			});

			child.stdout.on("close", function (data) {
				console.log(data);
				resolve("done");
			});
		});
	}

	async transcribeOne(transcribeOneDto: TranscribeOneDto) {
		console.log("transcribeOneDto", transcribeOneDto);
		const tmpDir = await fs.mkdtemp("/tmp/tidal-transcribe-");
		const audioPath = `${tmpDir}/audio.wav`;

		try {
			const ffmpegCommand = `ffmpeg -i ${transcribeOneDto.input.url} -vn -c:a pcm_s16le -ar 16000 -ac 1 ${audioPath}`;
			const ffmpeg_res = shell.exec(ffmpegCommand);
			console.log("ffmpeg_res", ffmpeg_res);

			const whisperOptions = {
				model: "tiny.en",
			};
			const whisperResult = shell.exec(`whisper ${audioPath} --model medium.en --language en --output_dir ${tmpDir}`);
			console.log("whisperResult", whisperResult);

			const s3Client = this.s3Service.s3ClientFactory({
				endpoint: transcribeOneDto.output.s3.endpoint,
				s3ForcePathStyle: true,
				credentials: {
					accessKeyId: transcribeOneDto.output.s3.accessKeyId,
					secretAccessKey: transcribeOneDto.output.s3.secretAccessKey,
				},
			});
			await this.s3Service.uploadDirectory({
				s3Client,
				directory: tmpDir,
				bucket: transcribeOneDto.output.s3.bucket,
				prefix: transcribeOneDto.output.s3.prefix,
			});

			return "audio is done transcribing";
		} catch (error) {
			console.error(error);
			throw new Error("failed to transcribe");
		} finally {
			await fs.remove(tmpDir);
		}
	}
}
