-- MM IT Tech Ltd - MVP schema for XAMPP/MySQL
CREATE DATABASE IF NOT EXISTS mm_it_tech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mm_it_tech_db;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  short_description TEXT,
  content LONGTEXT,
  featured_image VARCHAR(255) NULL,
  category VARCHAR(120) NULL,
  author VARCHAR(120) NULL,
  status ENUM('Draft','Published','Scheduled') NOT NULL DEFAULT 'Draft',
  published_date DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_published_date (published_date)
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  company_name VARCHAR(150) NULL,
  service_interested VARCHAR(150) NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('New','Contacted','In Progress','Converted','Closed') NOT NULL DEFAULT 'New',
  internal_note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT,
  features TEXT NULL,
  benefits TEXT NULL,
  image VARCHAR(255) NULL,
  display_order INT DEFAULT 0,
  is_enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_name VARCHAR(150) NOT NULL,
  company VARCHAR(150) NULL,
  message TEXT NOT NULL,
  rating INT DEFAULT 5,
  photo VARCHAR(255) NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS website_settings (
  id INT PRIMARY KEY,
  company_name VARCHAR(150) NOT NULL,
  company_description TEXT,
  contact_email VARCHAR(190),
  phone VARCHAR(50),
  address VARCHAR(255),
  hero_title VARCHAR(255),
  hero_description TEXT,
  cta_text VARCHAR(120),
  footer_text VARCHAR(255),
  site_stats TEXT NULL,
  whatsapp_number VARCHAR(32) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO website_settings (id, company_name, company_description, contact_email, phone, address, hero_title, hero_description, cta_text, footer_text, site_stats, whatsapp_number)
VALUES (1, 'MM IT Tech Ltd', 'MM IT Tech Ltd is a premier technology and IT solutions provider dedicated to delivering reliable, scalable, and secure IT infrastructure for modern businesses.', 'info@mmittech.com', '+44 0000 000000', 'London, United Kingdom', 'Powering Your Business with Smarter IT Solutions.', 'Reliable IT Support, Advanced Cloud Services, and Enterprise-Grade Cybersecurity to Keep Your Business Running Without Limits.', 'Talk to Our Experts', '© MM IT Tech Ltd. All rights reserved.', '{"years":"15+","uptime":"99.9%","endpoints":"2,400+","response":"<15m","clients":"250+","engineers":"40+","secured":"4,900+","recommend":"98%","rating":"4.9/5"}', '440000000000')
ON DUPLICATE KEY UPDATE company_name = VALUES(company_name);

INSERT INTO services (name, slug, description, features, benefits, display_order, is_enabled) VALUES
('Managed IT Support', 'managed-it-support', 'Proactive IT support to keep your systems running smoothly.', '24/7 monitoring,Helpdesk,Patch management', 'Reduced downtime,Improved productivity', 1, 1),
('Cloud Services & Cloud Migration', 'cloud-services', 'Secure cloud solutions and smooth migrations.', 'Cloud strategy,Migration planning,Optimization', 'Scalability,Cost efficiency', 2, 1),
('Cybersecurity Solutions', 'cybersecurity', 'Enterprise-grade protection for your business.', 'Threat monitoring,Firewall management,Security audits', 'Risk reduction,Compliance support', 3, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Default admin (change after first login): admin@mmittech.com / Admin@123
INSERT INTO admins (name, email, password_hash, role)
VALUES ('Administrator', 'admin@mmittech.com', '$2y$10$c0Vrj1Zf28021/vZuom19uPm0ETJYInHgk.k43rV0YZcZ7xHzpjmC', 'admin')
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- NOTE: the hash above is a real bcrypt hash of 'Admin@123'.
-- To set a different password, generate a new hash and UPDATE the row:
--   SELECT password_hash('YourNewPassword');
--   UPDATE admins SET password_hash = '<new hash>' WHERE email = 'admin@mmittech.com';
