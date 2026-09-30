'use client';

import { useEffect, useState } from 'react';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateEquipmentRequestSchema, CreateEquipmentRequestFormValues } from '@/lib/validations';
import { api } from '@/lib/api';
import { EquipmentCatalog } from '@/types';
import { useRouter } from 'next/navigation';

export default function RequestForm() {
  const router = useRouter();
  

  // Mock employee data (Since we don't have an auth service)
  const mockEmployee = {
    employeeName: 'Somchai Jaidee',
    employeeEmail: 'somchai.j@company.com',
    department: 'Engineering',
    title: 'Senior Developer'
  };

  const { register, setError, control, handleSubmit, formState: { errors } } = useForm<CreateEquipmentRequestFormValues>({
    resolver: zodResolver(CreateEquipmentRequestSchema),
    defaultValues: {
      ...mockEmployee,
      items: [{ equipmentType: '', specification: '', quantity: 1 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });



  const [actionType, setActionType] = useState<'DRAFT' | 'SUBMIT'>('DRAFT');

  const onSubmit = async (data: CreateEquipmentRequestFormValues) => {
    try {
      const res = await api.post('/equipment-requests', data);
      
      if (actionType === 'SUBMIT') {
        const newRequestId = res.data.id;
        await api.post(`/equipment-requests/${newRequestId}/submit`);
        alert('Request created and submitted successfully');
      } else {
        alert('Draft saved successfully');
      }
      
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 shadow mt-10 rounded-lg">
      <h1 className="text-2xl font-bold text-white mb-6">Create Equipment Request</h1>
      
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
                rows={3}
                placeholder="Why do you need this equipment?"
                className="mt-1 block w-full rounded-md border-gray-600 p-2 border text-white bg-gray-700"
              />
              {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Required Date <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                {...register('requiredDate')}
                className="mt-1 block w-full md:w-1/3 rounded-md border-gray-600 p-2 border text-white bg-gray-700"
              />
              {errors.requiredDate && <p className="text-red-500 text-xs mt-1">{errors.requiredDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Additional Note</label>
              <textarea 
                {...register('additionalNote')}
                rows={2}
                placeholder="Any specific preferences or notes? (Optional)"
                className="mt-1 block w-full rounded-md border-gray-600 p-2 border text-white bg-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Items */}
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
            <h2 className="text-lg font-semibold text-gray-200">3. Equipment Items</h2>
            <button 
              type="button" 
              onClick={() => append({ equipmentType: '', specification: '', quantity: 1 })}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              + Add Item
            </button>
          </div>
          
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-start mb-4 p-4 border rounded bg-gray-800 border-gray-600">
              <div className="flex-1 space-y-2">
                <select
                  {...register(`items.${index}.equipmentType`)}
                  className="block w-full rounded-md border-gray-500 p-2 border text-white bg-gray-700 uppercase"
                >
                  <option value="">Select Equipment Type</option>
                  <option value="NOTEBOOK">NOTEBOOK</option>
                  <option value="MONITOR">MONITOR</option>
                  <option value="KEYBOARD">KEYBOARD</option>
                  <option value="MOUSE">MOUSE</option>
                  <option value="HEADSET">HEADSET</option>
                  <option value="OTHER">OTHER</option>
                </select>
                {errors.items?.[index]?.equipmentType && (
                  <p className="text-red-500 text-xs mt-1">{errors.items[index]?.equipmentType?.message}</p>
                )}
                <input 
                  type="text"
                  placeholder="Specification (e.g. 16GB RAM, 512GB SSD)"
                  {...register(`items.${index}.specification`)}
                  className="block w-full rounded-md border-gray-500 p-2 border text-white bg-gray-700 text-sm"
                />
              </div>
              
              <div className="w-24">
                <input 
                  type="number" 
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  className="block w-full rounded-md border-gray-500 p-2 border text-white bg-gray-700"
                />
                {errors.items?.[index]?.quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.items[index]?.quantity?.message}</p>
                )}
              </div>
              
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-300 p-2 text-sm">
                  Remove
                </button>
              )}
            </div>
          ))}
          {errors.items && <p className="text-red-500 text-xs mt-1">{errors.items.root?.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-8">
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors mr-auto"
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            onClick={() => setActionType('DRAFT')}
            className="px-6 py-2 text-sm font-medium text-gray-200 bg-gray-700 rounded hover:bg-gray-600 transition-colors shadow-sm"
          >
            Save Draft
          </button>
          
          <button 
            type="submit" 
            onClick={() => setActionType('SUBMIT')}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-sm"
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}
