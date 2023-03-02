import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ReptilerModule } from './modules/reptiler/reptiler.module';
import { SearchEngineModule } from './modules/searchEngine/searchEngine.module';
import { ExcelModule } from './modules/excel/excel.module';

@Module({
  imports: [SearchEngineModule, ExcelModule, ReptilerModule],
  providers: [AppService],
})
export class AppModule {}
