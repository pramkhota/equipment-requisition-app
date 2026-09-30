-- V2__seed_data.sql
-- 1. PENDING Request
INSERT INTO equipment_requests (id, request_number, requester_id, employee_name, employee_email, department, title, purpose, additional_note, request_date, required_date, status, version, created_at, updated_at) 
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'REQ-2026-000001', 'employee-1', 'Somchai Developer', 'somchai@company.com', 'Software Engineering', 'Need new notebook', 'Need a notebook for the new project', 'Require at least 16 GB RAM', CURRENT_TIMESTAMP, CURRENT_DATE + INTERVAL '5 days', 'PENDING', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);
INSERT INTO equipment_request_items (id, request_id, equipment_type, specification, quantity, created_at, updated_at) VALUES 
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'NOTEBOOK', '16 GB RAM and 512 GB SSD', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'MONITOR', '27-inch monitor', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. DRAFT Request
INSERT INTO equipment_requests (id, request_number, requester_id, employee_name, employee_email, department, title, purpose, additional_note, request_date, required_date, status, version, created_at, updated_at) 
VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc', 'REQ-2026-000002', 'employee-1', 'Somchai Developer', 'somchai@company.com', 'Software Engineering', 'Requesting test device', 'Requesting a test device', null, CURRENT_TIMESTAMP, CURRENT_DATE + INTERVAL '10 days', 'DRAFT', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);
INSERT INTO equipment_request_items (id, request_id, equipment_type, specification, quantity, created_at, updated_at) VALUES 
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'OTHER', 'iPhone 15 Pro for iOS testing', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. APPROVED Request
INSERT INTO equipment_requests (id, request_number, requester_id, employee_name, employee_email, department, title, purpose, additional_note, request_date, required_date, status, approver_id, version, created_at, updated_at) 
VALUES (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'REQ-2026-000003', 'employee-2', 'Somsri Rakdee', 'somsri.r@company.com', 'Design', 'Ergonomics setup', 'Need a mouse and keyboard for better ergonomics', null, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_DATE + INTERVAL '2 days', 'APPROVED', 'approver-99', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);
INSERT INTO equipment_request_items (id, request_id, equipment_type, specification, quantity, created_at, updated_at) VALUES 
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'MOUSE', 'Ergonomic wireless mouse', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ffffffff-ffff-ffff-ffff-fffffffffff2', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'KEYBOARD', 'Mechanical keyboard (Red switch)', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. REJECTED Request
INSERT INTO equipment_requests (id, request_number, requester_id, employee_name, employee_email, department, title, purpose, additional_note, request_date, required_date, status, approver_id, rejection_reason, version, created_at, updated_at) 
VALUES (
    '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'REQ-2026-000004', 'employee-3', 'Manop Admin', 'manop@company.com', 'Operations', 'Tablet for notes', 'I want a tablet for taking notes', 'Preferably iPad Pro', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_DATE + INTERVAL '7 days', 'REJECTED', 'approver-99', 'Tablets are only provided for specific executive roles.', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);
INSERT INTO equipment_request_items (id, request_id, equipment_type, specification, quantity, created_at, updated_at) VALUES 
    ('11111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'OTHER', 'iPad Pro 11-inch', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 5. CANCELLED Request
INSERT INTO equipment_requests (id, request_number, requester_id, employee_name, employee_email, department, title, purpose, additional_note, request_date, required_date, status, version, created_at, updated_at) 
VALUES (
    '33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'REQ-2026-000005', 'employee-1', 'Somchai Developer', 'somchai@company.com', 'Software Engineering', 'Laptop for offsite', 'Need a laptop for offsite work', null, CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_DATE + INTERVAL '4 days', 'CANCELLED', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);
INSERT INTO equipment_request_items (id, request_id, equipment_type, specification, quantity, created_at, updated_at) VALUES 
    ('33333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'NOTEBOOK', 'Standard Windows laptop', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
