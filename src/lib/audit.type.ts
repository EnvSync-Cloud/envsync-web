type AppAuditActions = "app_created" 
   | "app_updated" 
   | "app_deleted" 
   | "app_viewed"
   | "apps_viewed";

type AuditLogAuditActions = "get_audit_logs"

type EnvAuditActions = "env_types_viewed"
    | "env_type_viewed"

type EnvStoreAuditActions = "env_created"
    | "env_updated"
    | "env_deleted"
    | "env_viewed"
    | "envs_viewed"
    | "envs_batch_created"
    | "envs_batch_updated";

type OnboardingAuditActions = "org_created"
    | "user_invite_created"
    | "user_invite_accepted"
    | "user_invite_viewed"
    | "user_invite_updated"
    | "user_invite_deleted";

type OrgAuditActions = "org_updated";

type UserAuditActions = "users_retrieved"
    | "user_retrieved"
    | "user_updated"
    | "user_deleted"
    | "user_role_updated"
    | "password_update_requested";

type CliAuditActions = "cli_command_executed";

export type AuditActions = AppAuditActions
    | AuditLogAuditActions
    | EnvAuditActions
    | EnvStoreAuditActions
    | OnboardingAuditActions
    | OrgAuditActions
    | UserAuditActions
    | CliAuditActions;
