-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS property_management;
USE property_management;

-- =======================
-- Users Table
-- =======================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'supervisor', 'client') DEFAULT 'client',
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================
-- Properties Table
-- =======================
CREATE TABLE IF NOT EXISTS properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255),
    type ENUM('Residential', 'Commercial') NOT NULL,
    units INT DEFAULT 0,
    status ENUM('Active', 'Pending', 'Inactive') DEFAULT 'Active',
    last_inspection DATE NULL,
    next_inspection DATE NULL,
    owner VARCHAR(150),
    contact VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================
-- Supervisors Table
-- =======================
CREATE TABLE IF NOT EXISTS supervisors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    specialization VARCHAR(100),
    certification VARCHAR(255),
    experience_years INT DEFAULT 0,
    hourly_rate DECIMAL(10,2) DEFAULT 0.00,
    availability_status ENUM('available', 'busy', 'unavailable') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_supervisor_user (user_id),
    INDEX idx_supervisor_availability (availability_status),
    INDEX idx_supervisor_specialization (specialization)
);

-- =======================
-- Inspectors Table
-- =======================
CREATE TABLE IF NOT EXISTS inspectors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    specialization VARCHAR(100),
    certification VARCHAR(100),
    experience_years INT DEFAULT 0,
    hourly_rate DECIMAL(10,2) DEFAULT 0.00,
    availability ENUM('available', 'busy', 'unavailable') DEFAULT 'available',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =======================
-- Inspections Table
-- =======================
CREATE TABLE IF NOT EXISTS inspections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    inspector_id INT NOT NULL, -- Linked with users table
    supervisor_id INT NULL,    -- Linked with supervisors table
    assigned_inspector_id INT NULL, -- Linked with inspectors table
    start_date DATE NOT NULL,
    completed_date DATE NULL,
    status ENUM('in-progress', 'completed', 'pending') DEFAULT 'in-progress',
    progress INT DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES supervisors(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_inspector_id) REFERENCES inspectors(id) ON DELETE SET NULL,
    INDEX idx_inspection_supervisor (supervisor_id)
);

-- =======================
-- Inspection Items
-- =======================
CREATE TABLE IF NOT EXISTS inspection_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inspection_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    item_text VARCHAR(255) NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE
);

-- =======================
-- Property Amenities
-- =======================
CREATE TABLE IF NOT EXISTS property_amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    amenity VARCHAR(100) NOT NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);
