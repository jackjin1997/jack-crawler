import { Controller, Get, Param } from "@nestjs/common";
import { FeizhuService } from "./feizhu.service";

@Controller("feizhu")
export class FeizhuController {
  constructor(private readonly service: FeizhuService) {}

  @Get("execFinancialProductCrawler/:fromDate")
  async execFinancialProductCrawler(@Param("fromDate") fromDate: string) {}
}
