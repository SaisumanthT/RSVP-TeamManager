import { Injectable } from '@angular/core';

//Service for centralized logging

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  log(message: string): void {
    console.log(`[Log]: ${message}`);
  }

  error(message: string, error?: any): void {
    console.error(`[Error]: ${message}`, error);
  }

  warn(message: string): void {
    console.warn(`[Warning]: ${message}`);
  }

  info(message: string): void {
    console.info(`[Info]: ${message}`);
  }
} 