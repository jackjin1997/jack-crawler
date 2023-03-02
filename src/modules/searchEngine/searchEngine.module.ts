import { Module } from '@nestjs/common';
import { SearchEngineRepository } from './searchEngine.repository';
import { SearchEngineService } from './searchEngine.service';

@Module({
  providers: [SearchEngineService, SearchEngineRepository],
  exports: [SearchEngineService, SearchEngineRepository],
})
export class SearchEngineModule {}
