export function Input(props) {
  return (
    <input
      className="w-full border border-border px-3 py-2 text-sm focus:border-fg focus:outline-none"
      {...props}
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      className="w-full border border-border px-3 py-2 text-sm resize-none focus:border-fg focus:outline-none"
      {...props}
    />
  );
}
