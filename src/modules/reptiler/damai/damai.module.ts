import { Module } from "@nestjs/common";
import { DamaiController } from "./damai.controller";
import { DamaiService } from "./damai.service";

@Module({
  controllers: [DamaiController],
  providers: [DamaiService],
  exports: [],
})
export class DamaiModule {}
