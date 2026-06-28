import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { UnprocessableEntityException, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { ApiExceptionFilter } from "./common/filters/api-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  const port = parseInt(process.env.PORT ?? "3000", 10);
  await app.listen(port, "0.0.0.0");
}

bootstrap();
