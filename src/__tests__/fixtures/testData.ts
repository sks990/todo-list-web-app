export const mockUser = {
    id: 'user_01',
    email: 'test@example.com',
    password: 'password123!',
    name: 'QA_Tester'
};

export const mockLoginResponse = {
    status: 200,
    token: 'mock_access_token',
    userInfo: {
        id: 'user_01',
        name: 'QA_Tester'
    }
};

export const errorTemplates = {
    unauthorized: { status: 401, message: 'Invalid credentials' },
    serverError: { status: 500, message: 'Internal Server Error' }
};