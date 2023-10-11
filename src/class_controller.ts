import { IsString, IsNumber, IsBoolean } from 'class-validator';

export class channelDto {
  @IsString()
  mobileNode: string;
}

export class hodlChannelDto {
  @IsString()
  request: string;
  @IsNumber()
  fee: number;
  @IsBoolean()
  feeInclusive: boolean;
  @IsBoolean()
  skipProbe: boolean;
}
