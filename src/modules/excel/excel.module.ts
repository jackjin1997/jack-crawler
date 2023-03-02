import { Module } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { ExcelController } from './excel.controller';
import { SearchEngineModule } from '../searchEngine/searchEngine.module';

@Module({
  imports: [SearchEngineModule],
  controllers: [ExcelController],
  providers: [ExcelService],
})
export class ExcelModule {}
