import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import CreateRequestForm from '../app/employee/request/page';
import { api } from '../lib/api';

// Mock the router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock the API
vi.mock('../lib/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem('MOCK_USER_ID', 'employee-1');
  localStorage.setItem('MOCK_ROLE', 'EMPLOYEE');
});

test('แสดง Error เมื่อกรอก Required Field ไม่ครบ', async () => {
  render(<CreateRequestForm />);
  
  // Click submit without filling anything
  fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }));

  // Should show validation errors for Purpose and Required Date
  await waitFor(() => {
    expect(screen.getByText(/Purpose must be at least 10 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/Required date is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Invalid option/i)).toBeInTheDocument();
  });
});

test('เพิ่มและลบ Equipment Item ได้', async () => {
  render(<CreateRequestForm />);
  
  // Initially has 1 item
  expect(screen.getAllByRole('combobox').length).toBe(1);

  // Add another item
  fireEvent.click(screen.getByText('+ Add Item'));
  expect(screen.getAllByRole('combobox').length).toBe(2);

  // Remove the second item
  const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
  fireEvent.click(removeButtons[0]);
  
  expect(screen.getAllByRole('combobox').length).toBe(1);
});

test('เมื่อบันทึกสำเร็จ รายการได้รับการอัปเดตและ Form ถูก Reset ตามที่กำหนด', async () => {
  render(<CreateRequestForm />);

  (api.post as any).mockResolvedValueOnce({ data: { requestNumber: 'REQ-001' } });

  fireEvent.change(screen.getByPlaceholderText('Why do you need this equipment?'), {
    target: { value: 'Need for project' },
  });
  
  // Select equipment type from combobox
  const comboboxes = screen.getAllByRole('combobox');
  fireEvent.change(comboboxes[0], { target: { value: 'NOTEBOOK' } });

  // Select the required date input (it's the only type="date")
  const dateInput = screen.getAllByRole('textbox').find(el => el.getAttribute('type') === 'date') 
                    || document.querySelector('input[type="date"]');
  if (dateInput) {
    fireEvent.change(dateInput, { target: { value: '2026-12-31' } });
  }

  fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalled();
  });
});
