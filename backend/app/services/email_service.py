"""
PMOS Email Service
用于发送系统通知、预警通知等邮件
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr, formatdate
from typing import List, Optional

from app.config import settings


class EmailService:
    """邮件发送服务"""

    def __init__(
        self,
        smtp_host: Optional[str] = None,
        smtp_port: Optional[int] = None,
        smtp_username: Optional[str] = None,
        smtp_password: Optional[str] = None,
        from_email: Optional[str] = None,
        from_name: Optional[str] = None,
        use_tls: bool = True,
    ):
        self.smtp_host = smtp_host or getattr(settings, "SMTP_HOST", "")
        self.smtp_port = smtp_port or getattr(settings, "SMTP_PORT", 587)
        self.smtp_username = smtp_username or getattr(settings, "SMTP_USERNAME", "")
        self.smtp_password = smtp_password or getattr(settings, "SMTP_PASSWORD", "")
        self.from_email = from_email or getattr(settings, "FROM_EMAIL", "")
        self.from_name = from_name or getattr(settings, "FROM_NAME", "PMOS 系统")
        self.use_tls = use_tls

    def _create_message(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> MIMEMultipart:
        """创建邮件消息"""
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = formataddr((self.from_name, self.from_email))
        msg["To"] = to_email
        msg["Date"] = formatdate(localtime=True)

        if text_content:
            msg.attach(MIMEText(text_content, "plain", "utf-8"))

        msg.attach(MIMEText(html_content, "html", "utf-8"))
        return msg

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """发送邮件"""
        if not self.smtp_host:
            print(f"[Email] SMTP not configured. Would send to {to_email}: {subject}")
            return False

        try:
            msg = self._create_message(to_email, subject, html_content, text_content)

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                if self.use_tls:
                    server.starttls()
                if self.smtp_username and self.smtp_password:
                    server.login(self.smtp_username, self.smtp_password)
                server.sendmail(self.from_email, [to_email], msg.as_string())

            print(f"[Email] Sent to {to_email}: {subject}")
            return True

        except Exception as e:
            print(f"[Email] Failed to send to {to_email}: {e}")
            return False

    def send_bulk_email(
        self,
        to_emails: List[str],
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> dict:
        """批量发送邮件"""
        results = {"sent": 0, "failed": 0, "errors": []}

        for email in to_emails:
            try:
                success = self.send_email(email, subject, html_content, text_content)
                if success:
                    results["sent"] += 1
                else:
                    results["failed"] += 1
            except Exception as e:
                results["failed"] += 1
                results["errors"].append({"email": email, "error": str(e)})

        return results

    def send_notification(
        self,
        to_email: str,
        notification_type: str,
        title: str,
        content: str,
        action_url: Optional[str] = None,
    ) -> bool:
        """发送系统通知邮件"""
        color_map = {
            "info": "#1890ff",
            "warning": "#faad14",
            "error": "#ff4d4f",
            "success": "#52c41a",
        }
        color = color_map.get(notification_type, "#1890ff")

        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: {color}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0;">{title}</h2>
            </div>
            <div style="border: 1px solid #e8e8e8; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
                <p style="color: #333; line-height: 1.6;">{content}</p>
                {f'<a href="{action_url}" style="display: inline-block; background: {color}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 16px;">查看详情</a>' if action_url else ''}
            </div>
            <div style="text-align: center; color: #999; font-size: 12px; margin-top: 16px;">
                <p>此邮件由 PMOS 系统自动发送，请勿直接回复。</p>
            </div>
        </div>
        """

        return self.send_email(to_email, f"[PMOS] {title}", html)


# 全局单例
email_service = EmailService()
