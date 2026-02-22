import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, map } from "rxjs";

interface WrappedResponse<T> {
  success: boolean;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  WrappedResponse<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<WrappedResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Skip wrapping if response already has success key
        if (data && typeof data === "object" && "success" in data) {
          return data;
        }
        return { success: true, data };
      }),
    );
  }
}
