-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS property_management;

-- Use Database
USE property_management;

-- Users table
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

-- Properties table
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

-- Inspections table
CREATE TABLE IF NOT EXISTS inspections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    inspector_id INT NOT NULL,
    start_date DATE NOT NULL,
    completed_date DATE NULL,
    status ENUM('in-progress', 'completed', 'pending') DEFAULT 'in-progress',
    progress INT DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Inspection checklist items
CREATE TABLE IF NOT EXISTS inspection_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inspection_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    item_text VARCHAR(255) NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE
);

-- Amenities (for properties)
CREATE TABLE IF NOT EXISTS property_amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    amenity VARCHAR(100) NOT NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);
