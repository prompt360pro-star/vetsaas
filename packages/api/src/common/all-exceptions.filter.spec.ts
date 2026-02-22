import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllExceptionsFilter],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);

    // Spy on Logger.prototype.error to verify logging calls
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Mock ArgumentsHost and Response
  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  const mockArgumentsHost = (res: Response) => {
    const host: Partial<ArgumentsHost> = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(res),
        getRequest: jest.fn(),
      }),
    };
    return host as ArgumentsHost;
  };

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should handle HttpException with string response', () => {
      const res = mockResponse();
      const host = mockArgumentsHost(res);
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

      filter.catch(exception, host);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
      }));
    });

    it('should handle HttpException with object response', () => {
      const res = mockResponse();
      const host = mockArgumentsHost(res);
      const exception = new HttpException({ message: 'Validation Error', error: 'Bad Request' }, HttpStatus.BAD_REQUEST);

      filter.catch(exception, host);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation Error',
        error: 'Bad Request',
      }));
    });

    it('should handle HttpException with array message (class-validator)', () => {
        const res = mockResponse();
        const host = mockArgumentsHost(res);
        const exception = new HttpException({ message: ['Name is required', 'Email is invalid'] }, HttpStatus.BAD_REQUEST);

        filter.catch(exception, host);

        expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Name is required; Email is invalid',
        }));
      });

    it('should handle standard Error', () => {
      const res = mockResponse();
      const host = mockArgumentsHost(res);
      const exception = new Error('Database connection failed');

      filter.catch(exception, host);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database connection failed',
        error: 'Internal Server Error',
      }));

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Unhandled exception: Database connection failed',
        expect.any(String) // Stack trace
      );
    });

    it('should handle unknown exception', () => {
        const res = mockResponse();
        const host = mockArgumentsHost(res);
        const exception = 'Unknown error string';

        filter.catch(exception, host);

        expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erro interno do servidor',
          error: 'Internal Server Error',
        }));
      });
  });
});
