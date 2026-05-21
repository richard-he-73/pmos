interface StatusPillProps {
  label: string;
  variant?: 'ok' | 'warn' | 'alert' | 'info';
}

const variantClassMap: Record<string, string> = {
  ok: 'status-ok',
  warn: 'status-warn',
  alert: 'status-alert',
  info: 'status-info',
};

export const StatusPill: React.FC<StatusPillProps> = ({ label, variant = 'ok' }) => {
  return (
    <span className={`status-pill ${variantClassMap[variant]}`}>
      {label}
    </span>
  );
};
