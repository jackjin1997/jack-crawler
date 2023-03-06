import { Controller, Get, Param } from "@nestjs/common";
import { XiechengService } from "./xiecheng.service";

@Controller("xiecheng")
export class XiechengController {
  constructor(private readonly service: XiechengService) {}

  @Get("execFinancialProductCrawler/:fromDate")
  async execFinancialProductCrawler(@Param("fromDate") fromDate: string) {}
}
