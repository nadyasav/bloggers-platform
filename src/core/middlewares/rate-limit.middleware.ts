import { NextFunction, Request, Response } from 'express';
import { RateLimitRepository } from '../repositories/rate-limit.repository';
import { DEFAULT_IP } from '../core.constants';

export class RateLimit {
  private rateLimitRepository: RateLimitRepository;

  constructor(rateLimitRepository: RateLimitRepository) {
    this.rateLimitRepository = rateLimitRepository;
  }

  create(url: string, limit: number, windowSeconds: number) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const ip = req.ip ?? DEFAULT_IP;
      const date = new Date();
      const expiresAt = new Date(date.getTime() + windowSeconds * 1000);

      await this.rateLimitRepository.createRequest({
        ip,
        url,
        date,
        expiresAt,
      });

      const dateFrom = new Date(date.getTime() - windowSeconds * 1000);
      const count = await this.rateLimitRepository.getRequestsCount(
        ip,
        url,
        dateFrom,
      );

      if (count > limit) {
        return res.sendStatus(429);
      }

      next();
    };
  }
}
