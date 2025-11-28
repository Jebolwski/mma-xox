/**
 * Security Utilities for MMA XOX
 * Handles input validation, sanitization, and common security checks
 */

/**
 * Validates and sanitizes player name
 * Only allows alphanumeric characters, spaces, and hyphens
 */
export const sanitizePlayerName = (name: string, maxLength: number = 16): string => {
    if (!name || typeof name !== 'string') {
        throw new Error('Invalid player name');
    }

    // 1. Trim and collapse multiple spaces
    const trimmed = name.trim().replace(/\s+/g, ' ');

    // 2. Remove all non-alphanumeric characters except space and hyphen
    const sanitized = trimmed.replace(/[^a-zA-Z0-9\s\-]/g, '');

    // 3. Apply length limit
    const limited = sanitized.slice(0, maxLength);

    // 4. Final validation - can't be empty
    if (!limited) {
        throw new Error('Player name must contain valid characters');
    }

    return limited;
};

/**
 * Validates image URL to prevent XSS through image sources
 */
export const isValidImageUrl = (url: string, allowedDomains?: string[]): boolean => {
    const defaultAllowedDomains = [
        'cdn2.iconfinder.com',
        'cdn-icons-png.freepik.com',
        'clipart-library.com',
        'dmxg5wxfqgb4u.cloudfront.net', // Replace with actual CDN
    ];

    const domains = allowedDomains || defaultAllowedDomains;

    try {
        const parsed = new URL(url);

        // Only allow HTTPS
        if (parsed.protocol !== 'https:') {
            console.warn('Non-HTTPS image URL blocked:', url);
            return false;
        }

        // Check if hostname is in whitelist
        const isAllowed = domains.some((domain) =>
            parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
        );

        if (!isAllowed) {
            console.warn('Image URL from untrusted domain:', parsed.hostname);
            return false;
        }

        return true;
    } catch (error) {
        console.warn('Invalid image URL:', url, error);
        return false;
    }
};

/**
 * Validates email format (basic check)
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validates password strength
 * Requirements:
 * - At least 8 characters
 * - Contains uppercase letter
 * - Contains lowercase letter
 * - Contains number
 * - Contains special character
 */
export const validatePasswordStrength = (password: string): {
    isValid: boolean;
    errors: string[];
} => {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Sanitizes room ID to prevent NoSQL injection
 */
export const sanitizeRoomId = (roomId: string): string => {
    if (!roomId || typeof roomId !== 'string') {
        throw new Error('Invalid room ID');
    }

    // Remove special characters that could be used in NoSQL injection
    const sanitized = roomId.replace(/[^a-zA-Z0-9\-_]/g, '');

    if (!sanitized) {
        throw new Error('Room ID contains invalid characters');
    }

    return sanitized.slice(0, 20); // Limit length
};

/**
 * Rate limiter helper
 * Usage: const canProceed = checkRateLimit('login', 5, 60000);
 */
const rateLimitMap = new Map<string, { attempts: number; resetTime: number }>();

export const checkRateLimit = (
    key: string,
    maxAttempts: number = 5,
    windowMs: number = 60000
): boolean => {
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
        // Reset or first attempt
        rateLimitMap.set(key, {
            attempts: 1,
            resetTime: now + windowMs,
        });
        return true;
    }

    if (record.attempts < maxAttempts) {
        record.attempts++;
        return true;
    }

    return false; // Rate limited
};

/**
 * Clears rate limit for a key
 */
export const clearRateLimit = (key: string): void => {
    rateLimitMap.delete(key);
};

/**
 * Safe console logging (development only)
 */
export const devLog = (label: string, data?: any): void => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${label}]`, data);
    }
};

/**
 * Safe error logging (removes sensitive data)
 */
export const safeErrorLog = (error: any): string => {
    if (error instanceof Error) {
        // Only return error message, not stack trace or details
        return `Error: ${error.message}`;
    }
    return 'An unexpected error occurred';
};
