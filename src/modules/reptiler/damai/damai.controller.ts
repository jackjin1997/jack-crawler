import { Controller, Get, Param } from "@nestjs/common";
import { DamaiService } from "./damai.service";

@Controller("damai")
export class DamaiController {
  constructor(private readonly service: DamaiService) {}

  @Get("execFinancialProductCrawler/:fromDate")
  async execFinancialProductCrawler(@Param("fromDate") fromDate: string) {}
}
