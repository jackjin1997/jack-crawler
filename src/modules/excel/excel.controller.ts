import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Header,
  StreamableFile,
} from '@nestjs/common';
import { ExcelService } from './excel.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Post('checkIndexOnSearchEngine')
  @UseInterceptors(FileInterceptor('file'))
  async checkIndexOnSearchEngine(@UploadedFile() file) {
    this.excelService.checkIndexOnSearchEngine(file.buffer);
    return 'running';
  }

  @Post('uploadPrivateEquity')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPrivateEquity(@UploadedFile() file) {
    this.excelService.uploadPrivateEquity(file.buffer);
    return 'running';
  }

  @Post('generatePEStatistic')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="result.xlsx"')
  @UseInterceptors(FileInterceptor('file'))
  async generatePEStatistic(@UploadedFile() file) {
    const buffer = await this.excelService.generatePEStatistic(file.buffer);
    // const stream = createReadStream(buffer);
    return new StreamableFile(buffer);
  }
}
