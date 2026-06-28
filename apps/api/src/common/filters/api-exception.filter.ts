import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const message = this.extractMessage(payload);

      response.status(status).json({
        success: false,
        message,
      });
      return;
    }

    console.error("[UnhandledException]", exception);

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Erro interno. Tente novamente mais tarde.",
    });
  }

  private extractMessage(payload: string | object) {
    if (typeof payload === "string") {
      return payload;
    }

    if ("message" in payload) {
      const message = (payload as { message?: string | string[] }).message;

      if (Array.isArray(message)) {
        return message[0] ?? "Dados invalidos.";
      }

      if (typeof message === "string") {
        return message;
      }
    }

    return "Dados invalidos.";
  }
}
