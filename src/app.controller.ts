import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { channelDto, hodlChannelDto } from './class_controller';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('api/v1/open')
  async createZeroConfChannel(@Body() args: channelDto): Promise<any> {
    return this.appService.openChannel(args);
  }

  @Post('api/v1/new')
  async getInvoice(@Body() args: hodlChannelDto): Promise<any> {
    return this.appService.getHodlChannel(args);
  }
}
