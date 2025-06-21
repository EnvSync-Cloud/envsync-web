export enum API_KEYS {
  GET_API_KEYS = "api-keys",
}

export interface FormData {
  name: string;
  contact_email: string;
  website: string;
  logo_url: string | null;
}

export interface FormErrors {
  name?: string;
  contact_email?: string;
  website?: string;
  logo_url?: string;
}

export const INITIAL_FORM_DATA: FormData = {
  name: "",
  contact_email: "",
  website: "",
  logo_url: null,
};

export const INITIAL_FORM_ERRORS: FormErrors = {};

// File upload constraints
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// Validation rules
export const MIN_ORG_NAME_LENGTH = 2;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface App {
  id: string;
  org_id: string;
  name: string;
  description: string;
  metadata: Record<string, any>;
  status?: string;
  created_at: Date;
  updated_at: Date;
  env_count?: number;
  secret_count?: number;
}

export interface FilterOptions {
  status: string;
  sortBy: 'name' | 'created_at' | 'updated_at';
  sortOrder: 'asc' | 'desc';
}

export interface Statistics {
  total: number;
  active: number;
  inactive: number;
  filtered: number;
}

// Constants
export const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  status: 'all',
  sortBy: 'updated_at',
  sortOrder: 'desc',
};

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const;

export const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'updated_at', label: 'Last Updated' },
] as const;

export const DEBOUNCE_DELAY = 300;

// Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface EnvironmentType {
  id: string;
  name: string;
  color: string;
}

export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  sensitive: boolean;
  env_type_id: string;
  created_at: Date;
  updated_at: Date;
  app_id: string;
  created_by?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface EnvVarFormData {
  key: string;
  value: string;
  sensitive: boolean;
  env_type_id: string;
}

export interface EnvVarFormErrors {
  key?: string;
  value?: string;
  env_type_id?: string;
}

export interface BulkEnvVarData {
  env_type_id: string;
  variables: Array<{
    key: string;
    value: string;
    sensitive: boolean;
  }>;
}

// Constants
export const MAX_KEY_LENGTH = 255;
export const MAX_VALUE_LENGTH = 10000;
export const ENV_VAR_KEY_REGEX = /^[A-Z][A-Z0-9_]*$/;

export const INITIAL_ENV_VAR_FORM: EnvVarFormData = {
  key: "",
  value: "",
  sensitive: false,
  env_type_id: "",
};

export const INITIAL_ENV_FORM_ERRORS: EnvVarFormErrors = {};

export const BULK_IMPORT_EXAMPLE = `# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/myapp
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=myapp

# API Configuration
API_KEY=your-secret-api-key-here
API_URL=https://api.example.com
API_TIMEOUT=30000

# Application Settings
DEBUG=true
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Third-party Services
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
SENDGRID_API_KEY=SG.your_sendgrid_api_key
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key
SESSION_SECRET=your-session-secret`;

// Environment variable categories for better organization
export const ENV_VAR_CATEGORIES = {
  DATABASE: ['DATABASE', 'DB', 'POSTGRES', 'MYSQL', 'MONGO', 'REDIS'],
  API: ['API', 'ENDPOINT', 'URL', 'URI'],
  AUTH: ['AUTH', 'JWT', 'TOKEN', 'SECRET', 'KEY', 'PASSWORD', 'CREDENTIAL'],
  CONFIG: ['CONFIG', 'SETTING', 'OPTION', 'FLAG'],
  SERVICE: ['SERVICE', 'EXTERNAL', 'THIRD_PARTY'],
} as const;

// Sensitive keywords that automatically mark variables as secrets
export const SENSITIVE_KEYWORDS = [
  'SECRET', 'PASSWORD', 'TOKEN', 'KEY', 'AUTH', 'CREDENTIAL', 
  'PRIVATE', 'JWT', 'API_KEY', 'STRIPE', 'PAYPAL', 'OAUTH'
] as const;

// Color palette for environment types
export const ENV_TYPE_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
] as const;

