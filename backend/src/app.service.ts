import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getLandingPage(): string {
    return 'Hello World!';
  }
}
