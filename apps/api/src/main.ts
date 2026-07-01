import "reflect-metadata";
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { UnprocessableEntityException, ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { AppModule } from "./app.module";
import { ApiExceptionFilter } from "./common/filters/api-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const firstError = errors[0];
        const message =
          firstError && firstError.constraints
            ? Object.values(firstError.constraints)[0]
            : "Dados invalidos.";

        return new UnprocessableEntityException(message);
      },
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());

  const publicDir = join(process.cwd(), "public");

  if (existsSync(publicDir)) {
    app.useStaticAssets(publicDir);

    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get(
      /^(?!\/api(?:\/|$)|\/health$).*/,
      (_request: unknown, response: { sendFile: (path: string) => void }) => {
        response.sendFile(join(publicDir, "index.html"));
      },
    );
  }

  const port = parseInt(process.env.PORT ?? "3000", 10);
  await app.listen(port, "0.0.0.0");
}

bootstrap();
