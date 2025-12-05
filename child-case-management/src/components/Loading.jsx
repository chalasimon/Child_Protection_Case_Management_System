// src/components/Loading.jsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-600 to-purple-800">
      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
    </div>
  );
}
