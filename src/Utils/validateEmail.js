export default function validateEmail(email) {
    // Check if email is provided and is a string
    if (!email || typeof email !== 'string') {
        return {
            isValid: false,
            error: 'Email must be a non-empty string'
        };
    }
    // Remove leading/trailing whitespace
    email = email.trim();
    // Check maximum total length (RFC 5321)
    if (email.length > 254) {
        return {
            isValid: false,
            error: 'Email address is too long'
        };
    }
    // Split into local and domain parts
    const parts = email.split('@');
    if (parts.length !== 2) {
        return {
            isValid: false,
            error: 'Email must contain exactly one @ symbol'
        };
    }
    const [local, domain] = parts;
    // Validate local part
    if (local.length === 0 || local.length > 64) {
        return {
            isValid: false,
            error: 'Local part must be between 1 and 64 characters'
        };
    }
    // Check local part for invalid characters
    const localRegex = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
    if (!localRegex.test(local)) {
        return {
            isValid: false,
            error: 'Local part contains invalid characters'
        };
    }
    // Check for invalid local part patterns
    if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
        return {
            isValid: false,
            error: 'Local part cannot start or end with a period or contain consecutive periods'
        };
    }
    // Validate domain part
    if (domain.length === 0 || domain.length > 255) {
        return {
            isValid: false,
            error: 'Domain must be between 1 and 255 characters'
        };
    }
    // Check domain format
    const domainRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
    if (!domainRegex.test(domain)) {
        return {
            isValid: false,
            error: 'Domain format is invalid'
        };
    }
    // Check if domain has at least one period
    if (!domain.includes('.')) {
        return {
            isValid: false,
            error: 'Domain must contain at least one period'
        };
    }
    // All checks passed
    return {
        isValid: true,
        error: null
    };};