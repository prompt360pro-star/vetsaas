import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

interface RateBucket {
  count: number;
  resetAt: number;
}

/**
 * In-memory rate limiter — 10 requests per minute per IP.
 * No Redis dependency needed for small-scale deployments.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store = new Map<string, RateBucket>();
  private readonly maxRequests = 10;
  private readonly windowMs = 60_000; // 1 minute

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let bucket = this.store.get(ip);

    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 0, resetAt: now + this.windowMs };
      this.store.set(ip, bucket);
    }

    bucket.count++;

    if (bucket.count > this.maxRequests) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Demasiados pedidos. Tente novamente em ${retryAfter}s.`,
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
