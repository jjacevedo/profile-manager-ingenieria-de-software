export function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

const baseFieldClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

export function Input({ className = "", ...props }) {
  return <input className={`${baseFieldClass} ${className}`} {...props} />;
}

export function TextArea({ className = "", ...props }) {
  return <textarea className={`${baseFieldClass} resize-y ${className}`} {...props} />;
}

export function Select({ className = "", ...props }) {
  return <select className={`${baseFieldClass} ${className}`} {...props} />;
}
