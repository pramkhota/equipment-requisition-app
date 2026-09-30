import { z } from 'zod';

export const RequestItemSchema = z.object({
  equipmentType: z.enum(['NOTEBOOK', 'MONITOR', 'KEYBOARD', 'MOUSE', 'HEADSET', 'OTHER'], {
    errorMap: () => ({ message: 'Please select a valid equipment type' })
  }),
  specification: z.string().max(250, 'Specification must not exceed 250 characters').optional().nullable(),
  quantity: z.number({ invalid_type_error: "Quantity is required" })
    .min(1, 'Quantity must be at least 1')
    .max(5, 'Quantity must not exceed 5'),
});

export const CreateEquipmentRequestSchema = z.object({
  employeeName: z.string().min(2, 'Employee name must be at least 2 characters').max(100, 'Employee name must not exceed 100 characters'),
  employeeEmail: z.string().email('Email format is invalid'),
  department: z.string().min(1, 'Department is required'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(150, 'Title must not exceed 150 characters'),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters').max(500, 'Purpose must not exceed 500 characters'),
  additionalNote: z.string().max(500, 'Additional note must not exceed 500 characters').optional().nullable(),
  requiredDate: z.string().min(1, 'Required date is required').refine((val) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(val);
    return inputDate >= today;
  }, { message: 'Required date must not be in the past' }),
  items: z.array(RequestItemSchema).min(1, 'Request must have at least one item'),
});

export type CreateEquipmentRequestFormValues = z.infer<typeof CreateEquipmentRequestSchema>;

export const DecisionSchema = z.object({
  isApproved: z.boolean(),
  rejectReason: z.string().optional(),
}).refine(data => {
  if (!data.isApproved && (!data.rejectReason || data.rejectReason.trim().length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Reject reason is mandatory when rejecting",
  path: ["rejectReason"]
});

export type DecisionFormValues = z.infer<typeof DecisionSchema>;
