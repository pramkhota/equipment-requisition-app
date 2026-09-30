'use client';

import { useEffect, useState } from 'react';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateEquipmentRequestSchema, CreateEquipmentRequestFormValues } from '@/lib/validations';
import { api } from '@/lib/api';
import { EquipmentCatalog, EquipmentRequest } from '@/types';
import { useRouter, useParams } from 'next/navigation';

export default function EditRequestForm() {
  const router = useRouter();
  const params = useParams();
  
  const [requestData, setRequestData] = useState<EquipmentRequest | null>(null);

  const { register, setError, control, handleSubmit, formState: { errors }, reset } = useForm<CreateEquipmentRequestFormValues>({
    resolver: zodResolver(CreateEquipmentRequestSchema)
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  useEffect(() => {
    
    api.get(`/equipment-requests/${params.id}`).then(res => {
      setRequestData(res.data);
      reset({
        employeeName: res.data.employeeName,
        employeeEmail: res.data.employeeEmail,
        department: res.data.department,
        title: res.data.title,
        purpose: res.data.purpose,
        additionalNote: res.data.additionalNote,
        requiredDate: res.data.requiredDate,
        items: res.data.items.map((item: any) => ({
          equipmentType: item.equipmentType || '',
          specification: item.specification || '',
          quantity: item.quantity
        }))
      });
    }).catch(console.error);
  }, [params.id, reset]);

  const onSubmit = async (data: CreateEquipmentRequestFormValues) => {
    try {
      await api.put(`/equipment-requests/${params.id}`, { ...data, version: requestData?.version });
      alert('Updated successfully');
      router.push('/employee/dashboard');
    } catch (error: any) {
      if (error.response?.data?.fieldErrors) {
        Object.entries(error.response.data.fieldErrors).forEach(([field, message]) => {
          setError(field as any, { type: 'server', message: message as string });
        });
      } else {
        alert(error.response?.data?.message || 'Error saving request');
      }
    }
  };

  const onSubmitRequest = async () => {
    // Save draft first, then submit
    handleSubmit(async (data) => {
      try {
        await api.put(`/equipment-requests/${params.id}`, { ...data, version: requestData?.version });
        await api.post(`/equipment-requests/${params.id}/submit`);
        alert('Request submitted successfully');
        router.push('/employee/dashboard');
      } catch (error: any) {
      if (error.response?.data?.fieldErrors) {
        Object.entries(error.response.data.fieldErrors).forEach(([field, message]) => {
          setError(field as any, { type: 'server', message: message as string });
        });
      } else {
        alert(error.response?.data?.message || 'Error saving request');
      }
    }
    })();
  };

  const onCancelRequest = async () => {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    try {
      await api.post(`/equipment-requests/${params.id}/cancel`);
      alert('Request cancelled');
      router.push('/employee/dashboard');
    } catch (error: any) {
      if (error.response?.data?.fieldErrors) {
        Object.entries(error.response.data.fieldErrors).forEach(([field, message]) => {
          setError(field as any, { type: 'server', message: message as string });
        });
      } else {
        alert(error.response?.data?.message || 'Error saving request');
      }
    }
  };

  if (!requestData) return <div className="p-10 text-white">Loading...</div>;

  const isDraft = requestData.status === 'DRAFT';
  const isPending = requestData.status === 'PENDING';

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 shadow mt-10 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          {isDraft ? 'Edit Equipment Request' : 'View Equipment Request'}
          {requestData.requestNumber && (
            <span className="text-sm font-normal text-gray-400 bg-gray-900 px-2 py-1 rounded">
              {requestData.requestNumber}
            </span>
          )}
        </h1>
        <span className={`px-3 py-1 rounded-full text-xs font-bold 
          ${isDraft ? 'bg-gray-700 text-gray-300' : 
            isPending ? 'bg-yellow-900 text-yellow-300' : 
            requestData.status === 'APPROVED' ? 'bg-emerald-900 text-emerald-300' : 
            requestData.status === 'CANCELLED' ? 'bg-gray-600 text-gray-200' : 'bg-red-900 text-red-300'}`}>
          {requestData.status}
        </span>
      </div>

      {requestData.status === 'REJECTED' && requestData.rejectReason && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 text-red-100 rounded-md">
          <strong>Reject Reason: </strong> {requestData.rejectReason}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Section 1: Requester Information */}
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-200 mb-4 border-b border-gray-700 pb-2">1. Requester Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400">Employee Name</label>
              <input type="text" {...register('employeeName')} readOnly className="mt-1 block w-full rounded border-gray-700 bg-gray-800 text-gray-400 p-2 text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400">Email</label>
              <input type="email" {...register('employeeEmail')} readOnly className="mt-1 block w-full rounded border-gray-700 bg-gray-800 text-gray-400 p-2 text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400">Department</label>
              <input type="text" {...register('department')} readOnly className="mt-1 block w-full rounded border-gray-700 bg-gray-800 text-gray-400 p-2 text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400">Job Title</label>
              <input type="text" {...register('title')} readOnly className="mt-1 block w-full rounded border-gray-700 bg-gray-800 text-gray-400 p-2 text-sm cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Section 2: Request Details */}
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-200 mb-4 border-b border-gray-700 pb-2">2. Request Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Purpose <span className="text-red-500">*</span></label>
              <textarea 
                {...register('purpose')}
                disabled={!isDraft}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-600 p-2 border text-white bg-gray-700 disabled:opacity-50"
              />
              {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Required Date <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                disabled={!isDraft}
                {...register('requiredDate')}
                className="mt-1 block w-full md:w-1/3 rounded-md border-gray-600 p-2 border text-white bg-gray-700 disabled:opacity-50"
              />
              {errors.requiredDate && <p className="text-red-500 text-xs mt-1">{errors.requiredDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Additional Note</label>
              <textarea 
                {...register('additionalNote')}
                disabled={!isDraft}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-600 p-2 border text-white bg-gray-700 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Items */}
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
            <h2 className="text-lg font-semibold text-gray-200">3. Equipment Items</h2>
            {isDraft && (
              <button type="button" onClick={() => append({ equipmentType: '', specification: '', quantity: 1 })} className="text-sm text-blue-400">
                + Add Item
              </button>
            )}
          </div>
          
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-start mb-4 p-4 border border-gray-700 rounded bg-gray-800">
              <div className="flex-1">
                <div className="space-y-2">
                  <input 
                    type="text"
                    disabled={!isDraft}
                    placeholder="Type (e.g. NOTEBOOK)"
                    {...register(`items.${index}.equipmentType`)}
                    className="block w-full rounded-md border-gray-500 p-2 border text-white bg-gray-700 disabled:opacity-50 uppercase"
                  />
                  <input 
                    type="text"
                    disabled={!isDraft}
                    placeholder="Specification (e.g. 16GB RAM, 512GB SSD)"
                    {...register(`items.${index}.specification`)}
                    className="block w-full rounded-md border-gray-500 p-2 border text-white bg-gray-700 disabled:opacity-50 text-sm"
                  />
                </div>
              </div>
              <div className="w-24">
                <input 
                  type="number" 
                  disabled={!isDraft}
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  className="block w-full rounded-md border-gray-500 p-2 border text-white bg-gray-700 disabled:opacity-50"
                />
              </div>
              {isDraft && fields.length > 1 && (
                <button type="button" onClick={() => remove(index)} className="text-red-400 p-2">Remove</button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-6 mt-8">
          <div>
            {(isDraft || isPending) && (
              <button 
                type="button" 
                onClick={onCancelRequest} 
                className="px-4 py-2 text-sm font-medium text-red-400 border border-red-900/50 rounded hover:bg-red-900/30 hover:text-red-300 transition-colors"
              >
                Cancel Request
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Back
            </button>
            
            {isDraft && (
              <>
                <button 
                  type="submit" 
                  className="px-6 py-2 text-sm font-medium text-gray-200 bg-gray-700 rounded hover:bg-gray-600 transition-colors shadow-sm"
                >
                  Save Draft
                </button>
                <button 
                  type="button" 
                  onClick={onSubmitRequest} 
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Submit Request
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
