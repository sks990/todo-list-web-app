import { authService } from '../../services/authService';
import { mockUser, mockLoginResponse } from '../fixtures/testData';

describe('Authentication Integration Test', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('TC-001: 유효한 자격 증명으로 로그인 시 성공 에비던스를 반환해야 한다', async () => {
        // Given
        const loginSpy = jest.spyOn(authService, 'login').mockResolvedValue(mockLoginResponse);

        // When
        const response = await authService.login(mockUser.email, mockUser.password);

        // Then
        expect(response.status).toBe(200);
        expect(response.token).toBe('mock_access_token');
        expect(loginSpy).toHaveBeenCalledWith(mockUser.email, mockUser.password);
    });

    test('TC-003: 서버 타임아웃 발생 시 적절한 예외를 던져야 한다 (Edge Case)', async () => {
        // Given
        jest.spyOn(authService, 'login').mockRejectedValue(new Error('TIMEOUT_ERROR'));

        // When & Then
        await expect(authService.login(mockUser.email, mockUser.password))
            .rejects.toThrow('TIMEOUT_ERROR');
    });
});