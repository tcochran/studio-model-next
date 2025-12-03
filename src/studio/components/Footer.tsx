import { handleLogout } from '@/app/actions/auth';

export default function Footer() {
  return (
    <footer className="border-t bg-white mt-auto">
      <div className="container mx-auto px-4 py-3 flex justify-end">
        <form action={handleLogout}>
          <button
            type="submit"
            className="text-gray-600 hover:text-gray-900 underline text-sm"
          >
            Logout
          </button>
        </form>
      </div>
    </footer>
  );
}
