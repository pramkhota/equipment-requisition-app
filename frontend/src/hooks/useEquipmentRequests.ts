import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PaginatedResponse, EquipmentRequest } from '@/types';

export function useEquipmentRequests(
  role: 'EMPLOYEE' | 'APPROVER',
  keyword: string,
  status: string,
  department: string,
  page: number,
  size: number = 10
) {
  const [data, setData] = useState<PaginatedResponse<EquipmentRequest> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchRequests = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
          sort: 'createdAt,desc'
        });

        if (keyword) params.append('keyword', keyword);
        if (status) params.append('status', status);
        if (department) params.append('department', department);

        const res = await api.get(`/equipment-requests?${params.toString()}`, {
          signal: controller.signal,
          headers: {
            'X-Role': role
          }
        });
        
        setData(res.data);
      } catch (err: any) {
        if (err.name === 'CanceledError') {
          return; // Request was aborted due to race condition prevention
        }
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();

    // Cleanup: Abort stale request if dependencies change before it finishes
    return () => {
      controller.abort();
    };
  }, [role, keyword, status, department, page, size]);

  return { data, isLoading, error };
}
