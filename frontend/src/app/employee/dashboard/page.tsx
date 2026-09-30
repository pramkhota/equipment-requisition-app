'use client';

import { EquipmentRequest, PaginatedResponse } from '@/types';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEquipmentRequests } from '@/hooks/useEquipmentRequests';

export default function EmployeeDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derived state from URL parameters
  const keyword = searchParams.get('keyword') || '';
  const status = searchParams.get('status') || '';
  const department = searchParams.get('department') || '';
  const page = parseInt(searchParams.get('page') || '0', 10);
  const size = 10;

  // Use custom hook for Server State and data fetching
  const { data, isLoading, error } = useEquipmentRequests('EMPLOYEE', keyword, status, department, page, size);

  // Helper to update URL params (Immutable update pattern for URL)
  const updateParams = (newParams: Record<string, string>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === '' && key !== 'status') {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });
    router.push(`?${current.toString()}`);
  };

  const getItemsDescription = (req: EquipmentRequest) => {
    if (!req.items || req.items.length === 0) return 'No items';
    const maxDisplay = 2;
    const displayItems = req.items.slice(0, maxDisplay).map(item => {
      return `${item.equipmentType} (${item.quantity})`;
    });
    if (req.items.length > maxDisplay) {
      return `${displayItems.join(', ')} + ${req.items.length - maxDisplay} more...`;
    }
    return displayItems.join(', ');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-100">My Requests</h1>
        <Link href="/employee/request" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
          + New Request
        </Link>
      </div>

      <div className="flex gap-4 mb-4">
        <input 
          type="text" 
          placeholder="Search Request No, Title, Name..." 
          value={keyword}
          onChange={(e) => updateParams({ keyword: e.target.value, page: '0' })}
          className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
        <select 
          value={department} 
          onChange={(e) => updateParams({ department: e.target.value, page: '0' })}
          className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
        >
          <option value="">All Departments</option>
          <option value="IT">IT</option>
          <option value="Software Engineering">Software Engineering</option>
          <option value="Design">Design</option>
          <option value="Operations">Operations</option>
        </select>
        <select 
          value={status} 
          onChange={(e) => updateParams({ status: e.target.value, page: '0' })}
          className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request No. / Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Requested</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {isLoading && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">Loading requests...</td></tr>
            )}
            {!isLoading && error && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-red-400">Error loading data.</td></tr>
            )}
            {!isLoading && !error && data?.content.map((req) => (
              <tr key={req.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  <span className="font-mono">{req.requestNumber || req.id.substring(0, 8)}</span><br/>
                  <span className="text-gray-500 text-xs">{new Date(req.createdAt).toLocaleDateString()}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate" title={getItemsDescription(req)}>
                  {getItemsDescription(req)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {req.requiredDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${req.status === 'DRAFT' ? 'bg-gray-700 text-gray-300' : 
                      req.status === 'PENDING' ? 'bg-yellow-900 text-yellow-300' : 
                      req.status === 'APPROVED' ? 'bg-emerald-900 text-emerald-300' : 
                      req.status === 'CANCELLED' ? 'bg-gray-600 text-gray-200' : 'bg-red-900 text-red-300'}`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/employee/request/${req.id}`} className="inline-flex items-center justify-center px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors shadow-sm">
                    {req.status === 'DRAFT' ? 'Edit Request' : 'View Details'}
                  </Link>
                </td>
              </tr>
            ))}
            {!isLoading && data?.content.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <p className="text-gray-400 mb-2">No requests found matching your criteria.</p>
                  <p className="text-sm text-gray-500">Total requests: {data?.totalElements || 0}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {data && data.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button 
            disabled={page === 0} 
            onClick={() => updateParams({ page: (page - 1).toString() })}
            className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-400 text-sm">
            Page {page + 1} of {data.totalPages} (Total: {data.totalElements})
          </span>
          <button 
            disabled={page >= data.totalPages - 1} 
            onClick={() => updateParams({ page: (page + 1).toString() })}
            className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <div className="mt-8">
        <button onClick={() => router.push('/')} className="text-gray-500 underline text-sm">
          &larr; Back to Role Selection
        </button>
      </div>
    </div>
  );
}
