import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UrlValidatorService {
  constructor(private httpService: HttpService) {}

  /**
   * Checks if a given URL is valid by making an HTTP request
   * @param url - The URL string to validate
   * @returns Promise<boolean> - true if URL returns 200 status, false otherwise
   */
  async checkUrlValidity(url: string): Promise<boolean> {
    try {
      // Make HTTP request to check if URL is accessible
      const response = await firstValueFrom(
        this.httpService.get(url, {
          timeout: 10000,
        })
      );

      // Return true only if status is 200 (OK)
      return response.status === HttpStatus.OK;
    } catch (error) {
      // If any error occurs (network error, timeout, invalid URL, etc.), return false
      return false;
    }
  }
}
