import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  providers: [AppService],
  controllers: [AppController],
  imports: [ConfigModule.forRoot({
    cache: true,
  })],
})
export class AppModule {}
