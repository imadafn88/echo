import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      {/* App name */}
      <Link to="/" className="text-lg font-semibold">
        Echo
      </Link>

      {/* Profile icon */}
      <Link
        to="/profile"
        className="w-8 h-8 border border-border flex items-center justify-center text-sm font-medium hover:bg-gray-100"
      >
        P
      </Link>
    </div>
  );
}
