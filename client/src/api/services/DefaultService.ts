/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponse } from '../models/AuthResponse';
import type { Health } from '../models/Health';
import type { LoginRequest } from '../models/LoginRequest';
import type { Quiz } from '../models/Quiz';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Health check
     * @returns Health API is healthy
     * @throws ApiError
     */
    public static getApiHealth(): CancelablePromise<Health> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/health',
        });
    }
    /**
     * Get sample quizzes
     * @returns Quiz A list of quizzes
     * @throws ApiError
     */
    public static getApiQuizzes(): CancelablePromise<Array<Quiz>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/quizzes',
        });
    }
    /**
     * Register a new user (demo)
     * @param requestBody
     * @returns any Created
     * @throws ApiError
     */
    public static postApiRegister(
        requestBody: RegisterRequest,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                409: `Conflict (username or email exists)`,
            },
        });
    }
    /**
     * Login (demo)
     * @param requestBody
     * @returns AuthResponse OK
     * @throws ApiError
     */
    public static postApiLogin(
        requestBody: LoginRequest,
    ): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Request password reset (mock)
     * @param requestBody
     * @returns any Email processed (mock)
     * @throws ApiError
     */
    public static postApiForgotPassword(
        requestBody: {
            email?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/forgot-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
            },
        });
    }
    /**
     * Trigger migrations (dev-only)
     * @returns any Migration started
     * @throws ApiError
     */
    public static postApiMigrate(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/migrate',
            errors: {
                500: `Migration error`,
                501: `Not available in this runtime`,
            },
        });
    }
}
