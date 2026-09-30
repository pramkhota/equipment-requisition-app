'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { EquipmentCatalog, EquipmentRequest } from '@/types';
import { useRouter, useParams } from 'next/navigation';

export default function ApproverViewRequest() {
  const router = useRouter();
  const params = useParams();
  
  const [requestData, setRequestData] = useState<EquipmentRequest | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {

    api.get(`/equipment-requests/${params.id}`).then(res => {
      setRequestData(res.data);
    }).catch(console.error);
  }, [params.id]);

  const handleDecision = async (isApproved: boolean) => {
    if (!isApproved && !rejectReason.trim()) {
      alert("Reject reason is required");
      return;
    }

    try {
      if (isApproved) {
        await api.post(`/equipment-requests/${params.id}/approve`);
      } else {
        await api.post(`/equipment-requests/${params.id}/reject`, {
          rejectReason: rejectReason
        });
      }
      alert(isApproved ? "Request Approved" : "Request Rejected");
      router.push('/approver/dashboard');
    } catch (error: any) {
      if (error.response?.status === 409) {
        alert("This request was modified by someone else.");
        router.push('/approver/dashboard');
      } else {
        alert(error.response?.data?.message || 'Error processing decision');
      }
    }
  };

  if (!requestData) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 shadow mt-10 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          Request Details
          {requestData.requestNumber && (
            <span className="text-sm font-normal text-gray-400 bg-gray-900 px-2 py-1 rounded">
              {requestData.requestNumber}
            </span>
          )}
        </h1>
        <span className={`px-3 py-1 rounded-full text-xs font-bold 
          ${requestData.status === 'PENDING' ? 'bg-yellow-900 text-yellow-300' : 
            requestData.status === 'APPROVED' ? 'bg-emerald-900 text-emerald-300' : 
            requestData.status === 'CANCELLED' ? 'bg-gray-600 text-gray-200' : 'bg-red-900 text-red-300'}`}>
          {requestData.status}
        </span>
      </div>
      
      <div className="space-y-6 text-gray-200">
        
        {requestData.status === 'REJECTED' && requestData.rejectReason && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-md">
          <strong>Reject Reason: </strong> {requestData.rejectReason}
        </div>
      )}

      {/* Section 1: Requester Information */}
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-200 mb-4 border-b border-gray-700 pb-2">1. Requester Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-400">Employee Name</p>
              <p className="font-medium text-white">{requestData.employeeName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Email</p>
              <p className="font-medium text-white">{requestData.employeeEmail}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Department</p>
              <p className="font-medium text-white">{requestData.department}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Job Title</p>
              <p className="font-medium text-white">{requestData.title}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Request Details */}
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-200 mb-4 border-b border-gray-700 pb-2">2. Request Details</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-400">Purpose</p>
              <p className="font-medium text-white bg-gray-800 p-3 rounded mt-1">{requestData.purpose}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Required Date</p>
              <p className="font-medium text-white">{requestData.requiredDate}</p>
            </div>
            {requestData.additionalNote && (
              <div>
                <p className="text-xs font-medium text-gray-400">Additional Note</p>
                <p className="font-medium text-white bg-gray-800 p-3 rounded mt-1">{requestData.additionalNote}</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Items */}
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4 border-b border-gray-700 pb-2">3. Items Requested</h3>
          <ul className="space-y-3">
            {requestData.items.map((item, index) => (
                <li key={index} className="flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-700">
                  <div>
                    <span className="font-bold text-gray-200">{item.equipmentType}</span>
                    {item.specification && <div className="text-sm text-gray-500">{item.specification}</div>}
                  </div>
                  <span className="font-bold text-blue-400 text-lg">x {item.quantity}</span>
                </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button 
            onClick={() => router.back()} 
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors mr-auto"
          >
            Back
          </button>
          
          {requestData.status === 'PENDING' && !showRejectInput && (
            <>
              <button 
                onClick={() => setShowRejectInput(true)} 
                className="px-4 py-2 text-sm font-medium text-red-400 border border-red-900/50 rounded hover:bg-red-900/30 hover:text-red-300 transition-colors"
              >
                Reject...
              </button>
              <button 
                onClick={() => handleDecision(true)} 
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-sm"
              >
                Approve Request
              </button>
            </>
          )}

          {requestData.status === 'PENDING' && showRejectInput && (
            <div className="flex flex-col gap-2 w-1/2">
              <input 
                type="text" 
                placeholder="Type reject reason..." 
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="border border-gray-600 p-2 text-sm rounded w-full text-white bg-gray-700"
                autoFocus
              />
              <div className="flex gap-2 justify-end mt-2">
                <button 
                  onClick={() => setShowRejectInput(false)} 
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDecision(false)} 
                  className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors shadow-sm"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
