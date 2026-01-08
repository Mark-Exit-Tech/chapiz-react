import Navbar from '@/components/layout/Navbar';
import { useNavigate } from 'react-router-dom';

// Placeholder component - TODO: implement admin panel
const AdminContent = () => {
  const navigate = useNavigate();

  return (
    <div className="flex grow flex-col h-screen items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <p className="text-gray-600 mb-6">Admin dashboard coming soon...</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-80"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default function AdminPage() {
  return (
    <>
      <Navbar />
      <AdminContent />
    </>
  );
}
