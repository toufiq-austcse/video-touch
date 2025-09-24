import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
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
      // Use HEAD request to check URL validity without downloading content
      const response = await firstValueFrom(
        this.httpService.head(url, {
          timeout: 10000, // Increased timeout to 30 seconds
          maxRedirects: 5, // Allow redirects
        })
      );

      // Return true for successful status codes (2xx range)
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      // Fallback to GET request with range header if HEAD fails
      try {
        const response = await firstValueFrom(
          this.httpService.get(url, {
            timeout: 130000,
            headers: {
              Range: 'bytes=0-0', // Request only first byte
            },
          })
        );

        return (response.status >= 200 && response.status < 300) || response.status === 206; // 206 for partial content
      } catch (fallbackError) {
        return false;
      }
    }
  }
}
