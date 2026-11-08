import type { ProblemCode } from './errors';
export interface SafeEvent {
  requestId: string;
  status: number;
  code: ProblemCode | 'OK';
}
export interface Logger {
  write(event: SafeEvent): void;
}
// Reconstruct an allowlisted record: never serialize requests, errors, bodies or headers.
export const sanitizedLogger: Logger = {
  write(event) {
    console.info(
      JSON.stringify({
        requestId: event.requestId,
        status: event.status,
        code: event.code,
      }),
    );
  },
};
