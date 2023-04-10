import { Test, TestingModule } from '@nestjs/testing';
import { TranscribeService } from './transcribe.service';

describe('TranscribeService', () => {
  let service: TranscribeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TranscribeService],
    }).compile();

    service = module.get<TranscribeService>(TranscribeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
