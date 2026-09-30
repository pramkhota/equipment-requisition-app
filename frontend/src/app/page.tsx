'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  const setRole = (userId: string, role: string) => {
    localStorage.setItem('MOCK_USER_ID', userId);
    localStorage.setItem('MOCK_ROLE', role);
    
    if (role === 'APPROVER') {
      router.push('/approver/dashboard');
    } else {
      router.push('/employee/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-100">IT Equipment Request System</h1>
        <p className="text-gray-400 mb-8">Please select a role to simulate authentication.</p>
        
        <div className="space-y-4">
          <button 
            onClick={() => setRole('employee-1', 'EMPLOYEE')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded transition-colors"
          >
            Login as Employee (Requester)
          </button>
          
          <button 
            onClick={() => setRole('approver-99', 'APPROVER')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded transition-colors"
          >
            Login as Manager (Approver)
          </button>
        </div>
      </div>
    </div>
  );
}
