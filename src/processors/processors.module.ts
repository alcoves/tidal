import { Module } from '@nestjs/common';
import { AudioTranscodeProcessor } from './audio.processor';

@Module({
  providers: [AudioTranscodeProcessor],
})
export class ProcessorsModule {}
