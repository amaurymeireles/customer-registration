interface ApiErrorProps {
  message: string;
}

export default function ApiError({ message }: ApiErrorProps) {
  return (
    <div className="api-error" role="alert">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7.5" stroke="#dc2626" />
        <path d="M8 4v4M8 11v1" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {message}
    </div>
  );
}
