interface AlertCardProps {
  message: string;
  count?: number;
  level: 'info' | 'warn' | 'crit';
}

const iconMap: Record<string, string> = {
  info: 'ℹ️',
  warn: '⚠️',
  crit: '🚨',
};

export const AlertCard: React.FC<AlertCardProps> = ({ message, count, level }) => {
  return (
    <div className={`alert-row ${level}`}>
      <span className="alert-icon">{iconMap[level]}</span>
      <span className="alert-text">{message}</span>
      {count !== undefined && <span className="alert-count mono-value">{count}</span>}
    </div>
  );
};
