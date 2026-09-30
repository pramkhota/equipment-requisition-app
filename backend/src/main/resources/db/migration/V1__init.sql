CREATE TABLE equipment_requests (
    id UUID PRIMARY KEY,
    request_number VARCHAR(50) UNIQUE,
    requester_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    employee_email VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    title VARCHAR(150) NOT NULL,
    purpose TEXT NOT NULL,
    additional_note TEXT,
    request_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    required_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    approver_id VARCHAR(50),
    rejection_reason TEXT,
    version INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment_request_items (
    id UUID PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES equipment_requests(id) ON DELETE CASCADE,
    equipment_type VARCHAR(100) NOT NULL,
    specification VARCHAR(250),
    quantity INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_equipment_requests_requester ON equipment_requests(requester_id);
CREATE INDEX idx_equipment_requests_status ON equipment_requests(status);
