export function Button({ variant = "primary", className = "", ...props }) {
  const base =
    "border px-4 py-2 text-sm font-medium transition focus:outline-none";

  const styles = {
    primary: "bg-fg text-bg border-fg hover:bg-bg hover:text-fg",
    danger: "bg-accent text-bg border-accent hover:bg-bg hover:text-accent",
    ghost: "bg-bg text-fg border-border hover:bg-gray-100",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props} />
  );
}
