export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4 text-gray-600">
          You do not have permission to access this page. Please check your access rights.
        </p>
      </div>
    </div>
  );
} 