import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BaseApiResponse<T> {
  @ApiProperty()
  public status?: number;

  @ApiProperty()
  public message: string;

  @ApiProperty()
  public errors?: string[];

  @ApiProperty()
  public payload?: any;

  public data: T; // Swagger Decorator is added in the extended class below, since that will override this one.
}

export function SwaggerBaseApiResponse<T>(type: T, statusCode: number): typeof BaseApiResponse {
  class ExtendedBaseApiResponse<T> extends BaseApiResponse<T> {
    @ApiProperty({ type })
    public declare data: T;

    @ApiProperty({ default: statusCode })
    public declare status: number;
  }

  // NOTE : Overwrite the returned class name, otherwise whichever type calls this function in the last,
  // will overwrite all previous definitions. i.e., Swagger will have all response types as the same one.
  const isAnArray = Array.isArray(type) ? ' [ ] ' : '';
  Object.defineProperty(ExtendedBaseApiResponse, 'name', {
    value: `SwaggerBaseApiResponseFor ${type} ${isAnArray}`,
  });

  return ExtendedBaseApiResponse;
}

export class BaseApiErrorObject {
  @ApiProperty({ type: Number })
  public statusCode: number;

  @ApiProperty({ type: String })
  public message: string;

  @ApiPropertyOptional({ type: String })
  public localizedMessage: string;

  @ApiProperty({ type: String })
  public errorName: string;

  @ApiProperty({ type: Object })
  public details: unknown;

  @ApiProperty({ type: String })
  public path: string;

  @ApiProperty({ type: String })
  public requestId: string;

  @ApiProperty({ type: String })
  public timestamp: string;
}

export class BaseApiErrorResponse {
  public status: number;

  @ApiProperty()
  public message: string;

  @ApiProperty()
  public errors: string[];

  @ApiProperty({ default: null })
  public data: any;
}

export function SwaggerBaseApiErrorResponse(statusCode: number): typeof BaseApiErrorResponse {
  class ExtendedBaseApiErrorResponse extends BaseApiErrorResponse {
    @ApiProperty({ default: statusCode })
    public declare status: number;
  }

  // NOTE : Overwrite the returned class name, otherwise whichever type calls this function in the last,
  // will overwrite all previous definitions. i.e., Swagger will have all response types as the same one.
  //const isAnArray = Array.isArray(type) ? ' [ ] ' : '';
  Object.defineProperty(ExtendedBaseApiErrorResponse, 'name', {
    value: `SwaggerBaseApiErrorResponseFor ${statusCode}`,
  });

  return ExtendedBaseApiErrorResponse;
}
