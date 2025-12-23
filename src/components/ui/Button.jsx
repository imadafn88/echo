export function Button({ children, ...props }) {
  return (
    <button
      className="px-4 py-2 rounded bg-black text-white hover:opacity-90"
      {...props}
    >
      {children}
    </button>
  );
}
