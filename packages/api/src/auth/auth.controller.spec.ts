import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  const mockProfile = {
    id: 'user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      const dto: RegisterDto = {
        clinicName: 'Test Clinic',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      mockAuthService.register.mockResolvedValue(mockTokens);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ success: true, data: mockTokens });
    });
  });

  describe('login', () => {
    it('should login a user and return tokens', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockTokens);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto.email, dto.password);
      expect(result).toEqual({ success: true, data: mockTokens });
    });
  });

  describe('refresh', () => {
    it('should refresh tokens', async () => {
      const dto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      mockAuthService.refreshTokens.mockResolvedValue(mockTokens);

      const result = await controller.refresh(dto);

      expect(authService.refreshTokens).toHaveBeenCalledWith(dto.refreshToken);
      expect(result).toEqual({ success: true, data: mockTokens });
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const req = { user: { sub: 'user-id' } };
      mockAuthService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(req);

      expect(authService.getProfile).toHaveBeenCalledWith('user-id');
      expect(result).toEqual({ success: true, data: mockProfile });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const req = { user: { sub: 'user-id' } };
      const updateBody = { firstName: 'Updated' };
      const updatedProfile = { ...mockProfile, ...updateBody };

      mockAuthService.updateProfile.mockResolvedValue(updatedProfile);

      const result = await controller.updateProfile(req, updateBody);

      expect(authService.updateProfile).toHaveBeenCalledWith('user-id', updateBody);
      expect(result).toEqual({ success: true, data: updatedProfile });
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const req = { user: { sub: 'user-id' } };
      const body = { oldPassword: 'old', newPassword: 'new' };

      mockAuthService.changePassword.mockResolvedValue(undefined);

      const result = await controller.changePassword(req, body);

      expect(authService.changePassword).toHaveBeenCalledWith('user-id', body.oldPassword, body.newPassword);
      expect(result).toEqual({ success: true, message: 'Password updated successfully' });
    });
  });
});
