import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ClientsModule } from "./clients/clients.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [PrismaModule, ClientsModule],
  controllers: [AppController],
})
export class AppModule {}
