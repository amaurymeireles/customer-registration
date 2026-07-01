import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
import { ClientsModule } from "./clients/clients.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [PrismaModule, ClientsModule, HealthModule],
})
export class AppModule {}