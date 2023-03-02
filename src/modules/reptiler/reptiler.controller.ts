import { Controller, Get, Param } from '@nestjs/common';
import { ReptilerService } from './reptiler.service';

@Controller('reptiler')
export class ReptilerController {
  constructor(private readonly service: ReptilerService) {}

  @Get('execFinancialProductCrawler/:fromDate')
  async execFinancialProductCrawler(@Param('fromDate') fromDate: string) {
    return this.service.financialProductCrawler(fromDate);
  }
}
