from pydantic import BaseModel


class UserProfileUpdate(BaseModel):
    display_name: str | None = None
    email: str | None = None
    phone: str | None = None
    department: str | None = None
    position: str | None = None
    bio: str | None = None


class NotificationSettings(BaseModel):
    emailNotification: bool = True
    inAppNotification: bool = True
    browserNotification: bool = False
    taskReminder: bool = True
    riskAlert: bool = True


class SecuritySettings(BaseModel):
    twoFactorAuth: bool = False
    loginNotification: bool = True


class AppearanceSettings(BaseModel):
    theme: str = "light"
    accentColor: str = "#1890ff"
    fontSize: str = "medium"
    compactLayout: bool = False


class UserSettings(BaseModel):
    profile: UserProfileUpdate
    notifications: NotificationSettings
    security: SecuritySettings
    appearance: AppearanceSettings


class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str
