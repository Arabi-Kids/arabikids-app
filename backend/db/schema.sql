-- ArabiKids database schema
-- "Teaching the Language of the Quran, One Kid at a Time."

CREATE DATABASE IF NOT EXISTS arabikids CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE arabikids;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  child_name VARCHAR(120) DEFAULT NULL,
  age_group ENUM('junior', 'explorer') DEFAULT 'junior',
  role ENUM('parent', 'admin') NOT NULL DEFAULT 'parent',
  subscription_status ENUM('free', 'active', 'past_due', 'canceled') NOT NULL DEFAULT 'free',
  subscription_plan ENUM('monthly', 'annual') DEFAULT NULL,
  stripe_customer_id VARCHAR(120) DEFAULT NULL,
  stripe_subscription_id VARCHAR(120) DEFAULT NULL,
  current_period_end DATETIME DEFAULT NULL,
  reset_token VARCHAR(255) DEFAULT NULL,
  reset_token_expires DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  age_group ENUM('junior', 'explorer') NOT NULL,
  lesson_number INT NOT NULL,
  title VARCHAR(190) NOT NULL,
  lesson_goal VARCHAR(255) NOT NULL,
  arabic_word VARCHAR(120) NOT NULL,
  arabic_word_meaning VARCHAR(190) NOT NULL,
  content JSON NOT NULL,
  is_free TINYINT(1) NOT NULL DEFAULT 0,
  estimated_minutes INT NOT NULL DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_age_lesson (age_group, lesson_number)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS exercises (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id INT NOT NULL,
  exercise_number INT NOT NULL,
  title VARCHAR(190) NOT NULL,
  instruction VARCHAR(255) NOT NULL,
  options JSON NOT NULL,
  correct_answer VARCHAR(255) NOT NULL,
  explanation VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  score INT DEFAULT 0,
  completed_at DATETIME DEFAULT NULL,
  attempts INT NOT NULL DEFAULT 0,
  last_attempt_at DATETIME DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_user_lesson (user_id, lesson_id)
) ENGINE=InnoDB;

CREATE INDEX idx_lessons_age_group ON lessons(age_group);
CREATE INDEX idx_users_email ON users(email);
