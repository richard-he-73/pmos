"""
Email Notification Service
"""
import asyncio
from typing import Optional, List, Dict, Any
from smtplib import SMTP
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from pathlib import Path
from app.config import settings
from app.services.cache import cache


class EmailService:
    """Email notification service"""
    
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.sender_email = settings.SMTP_FROM
        self.enabled = settings.EMAIL_ENABLED
        
    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        html_content: Optional[str] = None,
        attachments: Optional[List[Path]] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
    ) -> bool:
        """
        Send an email
        
        Args:
            to_email: Recipient email
            subject: Email subject
            body: Plain text body
            html_content: Optional HTML body
            attachments: Optional list of file paths to attach
            cc: Optional CC recipients
            bcc: Optional BCC recipients
            
        Returns:
            True if email sent successfully
        """
        if not self.enabled:
            print(f"⚠️  Email service disabled - would send to {to_email}: {subject}")
            return True
            
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.sender_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            if cc:
                msg['Cc'] = ', '.join(cc)
                
            # Add text body
            msg.attach(MIMEText(body, 'plain', 'utf-8'))
            
            # Add HTML body if provided
            if html_content:
                msg.attach(MIMEText(html_content, 'html', 'utf-8'))
                
            # Add attachments
            if attachments:
                for file_path in attachments:
                    if file_path.exists():
                        with open(file_path, 'rb') as f:
                            part = MIMEApplication(f.read(), Name=file_path.name)
                        part['Content-Disposition'] = f'attachment; filename="{file_path.name}"'
                        msg.attach(part)
                        
            # Send email
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._send_sync, msg, to_email, cc, bcc)
            
            print(f"✅ Email sent to {to_email}: {subject}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send email to {to_email}: {e}")
            return False
            
    def _send_sync(
        self,
        msg: MIMEMultipart,
        to_email: str,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
    ) -> None:
        """Synchronous email sending"""
        recipients = [to_email]
        if cc:
            recipients.extend(cc)
        if bcc:
            recipients.extend(bcc)
            
        with SMTP(self.smtp_host, self.smtp_port) as server:
            if self.smtp_user and self.smtp_password:
                server.login(self.smtp_user, self.smtp_password)
            server.send_message(msg)
            
    async def send_project_created(
        self,
        project_name: str,
        project_code: str,
        recipient_email: str,
        created_by: str,
        project_url: Optional[str] = None,
    ) -> bool:
        """Send project created notification"""
        subject = f"🎉 新项目创建: {project_name}"
        
        body = f"""
你好！

项目 {project_name} ({project_code}) 已由 {created_by} 创建。

项目名称: {project_name}
项目编号: {project_code}
创建者: {created_by}

"""
        if project_url:
            body += f"\n查看项目: {project_url}\n"
            
        return await self.send_email(recipient_email, subject, body)
        
    async def send_task_assigned(
        self,
        task_title: str,
        task_id: str,
        project_name: str,
        assignee_email: str,
        assigned_by: str,
        due_date: Optional[str] = None,
        task_url: Optional[str] = None,
    ) -> bool:
        """Send task assigned notification"""
        subject = f"📋 新任务分配: {task_title}"
        
        body = f"""
你好！

你有一个新任务分配：

任务标题: {task_title}
所属项目: {project_name}
分配者: {assigned_by}
"""
        if due_date:
            body += f"截止日期: {due_date}\n"
            
        if task_url:
            body += f"\n查看任务: {task_url}\n"
            
        return await self.send_email(assignee_email, subject, body)
        
    async def send_task_updated(
        self,
        task_title: str,
        task_id: str,
        project_name: str,
        old_status: str,
        new_status: str,
        recipient_email: str,
        updated_by: str,
        task_url: Optional[str] = None,
    ) -> bool:
        """Send task status updated notification"""
        subject = f"🔄 任务状态更新: {task_title}"
        
        body = f"""
你好！

任务状态已更新：

任务标题: {task_title}
所属项目: {project_name}
状态变更: {old_status} → {new_status}
更新者: {updated_by}
"""
        if task_url:
            body += f"\n查看任务: {task_url}\n"
            
        return await self.send_email(recipient_email, subject, body)
        
    async def send_risk_created(
        self,
        risk_title: str,
        risk_level: str,
        project_name: str,
        recipient_email: str,
        created_by: str,
        risk_url: Optional[str] = None,
    ) -> bool:
        """Send risk created notification"""
        subject = f"⚠️  新风险识别: {risk_title}"
        
        body = f"""
你好！

新风险已识别：

风险标题: {risk_title}
风险等级: {risk_level}
所属项目: {project_name}
识别者: {created_by}
"""
        if risk_url:
            body += f"\n查看风险: {risk_url}\n"
            
        return await self.send_email(recipient_email, subject, body)
        
    async def send_comment_added(
        self,
        comment_text: str,
        entity_type: str,
        entity_title: str,
        project_name: str,
        recipient_email: str,
        commented_by: str,
        entity_url: Optional[str] = None,
    ) -> bool:
        """Send comment added notification"""
        subject = f"💬 新评论: {entity_title}"
        
        body = f"""
你好！

{entity_type} 有新评论：

评论内容:
{comment_text}

所属项目: {project_name}
评论者: {commented_by}
"""
        if entity_url:
            body += f"\n查看详情: {entity_url}\n"
            
        return await self.send_email(recipient_email, subject, body)
        
    async def send_project_reminder(
        self,
        project_name: str,
        project_code: str,
        project_deadline: str,
        recipient_email: str,
        days_remaining: int,
        project_url: Optional[str] = None,
    ) -> bool:
        """Send project deadline reminder"""
        subject = f"⏰ 项目提醒: {project_name}"
        
        urgency = "⚠️ 紧急！" if days_remaining <= 3 else ""
        
        body = f"""
你好！

{urgency}
项目 {project_name} ({project_code}) 将在 {days_remaining} 天后到期。

项目名称: {project_name}
截止日期: {project_deadline}
剩余天数: {days_remaining}
"""
        if project_url:
            body += f"\n查看项目: {project_url}\n"
            
        return await self.send_email(recipient_email, subject, body)
        
    async def send_password_reset(
        self,
        user_email: str,
        reset_token: str,
        reset_url: str,
    ) -> bool:
        """Send password reset email"""
        subject = "🔑 密码重置请求"
        
        body = f"""
你好！

收到密码重置请求，请点击以下链接重置密码：

{reset_url}

此链接将在 24 小时后过期。

如果这不是你发起的请求，请忽略此邮件。

"""
        return await self.send_email(user_email, subject, body)
        
    async def send_welcome_email(
        self,
        user_email: str,
        user_name: str,
        login_url: Optional[str] = None,
    ) -> bool:
        """Send welcome email to new user"""
        subject = f"👋 欢迎使用 PMOS, {user_name}!"
        
        body = f"""
你好 {user_name}！

欢迎加入 PMOS 项目管理系统！

你现在可以使用你的账户登录并开始管理项目。
"""
        if login_url:
            body += f"\n登录地址: {login_url}\n"
            
        return await self.send_email(user_email, subject, body)


# Global email service instance
email_service = EmailService()
