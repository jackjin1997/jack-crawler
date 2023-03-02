import { Module } from '@nestjs/common';
import { ObsService } from './obs.service';

@Module({
  providers: [ObsService],
  exports: [ObsService],
})
export class SearchEngineModule {}
