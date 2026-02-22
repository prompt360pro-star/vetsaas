import { Test, TestingModule } from "@nestjs/testing";
import { AllExceptionsFilter } from "./all-exceptions.filter";
import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response } from "express";

describe("AllExceptionsFilter", () => {
  let filter: AllExceptionsFilter;
  let mockResponse: Partial<Response>;
  let mockArgumentsHost: Partial<ArgumentsHost>;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllExceptionsFilter],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn(),
      }),
    };
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    jest.restoreAllMocks();
  });

  it("should catch HttpException and return correct response", () => {
    const exception = new HttpException("Forbidden", HttpStatus.FORBIDDEN);

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: "Forbidden",
        success: false,
      }),
    );
  });

  it("should catch unknown Error and return message in development", () => {
    const exception = new Error("Database connection failed");
    process.env.NODE_ENV = "development";
    const loggerSpy = jest
      .spyOn(Logger.prototype, "error")
      .mockImplementation();

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Database connection failed",
        success: false,
      }),
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Unhandled exception: Database connection failed",
      ),
      expect.any(String),
    );
  });

  it("should catch unknown Error and return generic message in production", () => {
    const exception = new Error("Database connection failed");
    process.env.NODE_ENV = "production";
    const loggerSpy = jest
      .spyOn(Logger.prototype, "error")
      .mockImplementation();

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal Server Error",
        success: false,
      }),
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Unhandled exception: Database connection failed",
      ),
      expect.any(String),
    );
  });
});
