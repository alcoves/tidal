import { TranscribeOneDto } from "./dto/transcribe-one.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TranscribeService {
	transcribeOneBatch() {
		return "This action transcribes one batch";
	}

	transcribeOne(transcribeOneDto: TranscribeOneDto) {
		console.log("Time for the magic to happen");
		console.log("transcribeOneDto", transcribeOneDto);
		return "done!";
	}
}
