import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { CreateClientDto } from "./dto/create-client.dto";
import { ClientsService } from "./clients.service";

@Controller("api/clients")
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }
}
