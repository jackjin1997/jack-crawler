import { Module } from "@nestjs/common";
import { XiechengController } from "./xiecheng.controller";
import { XiechengService } from "./xiecheng.service";

@Module({
  controllers: [XiechengController],
  providers: [XiechengService],
  exports: [],
})
export class XiechengModule {}
