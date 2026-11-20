const variants = new Set(["neutral", "primary", "success", "warning", "danger"]);

export default function Badge({ variant = "neutral", children, className = "" }) {
  const safeVariant = variants.has(variant) ? variant : "neutral";
  return (
    <span className={`badge badge-${safeVariant}${className ? ` ${className}` : ""}`}>
      {children}
    </span>
  );
}
