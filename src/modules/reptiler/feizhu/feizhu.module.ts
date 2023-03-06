import { Module } from "@nestjs/common";
import { FeizhuController } from "./feizhu.controller";
import { FeizhuService } from "./feizhu.service";

@Module({
  controllers: [FeizhuController],
  providers: [FeizhuService],
  exports: [],
})
export class FeizhuModule {}
