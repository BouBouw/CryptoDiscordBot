-- Table pour les utilisateurs
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    coins DECIMAL(15, 2) DEFAULT 0,
    crypto DECIMAL(15, 8) DEFAULT 0
);

-- Table pour les transactions
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('buy', 'sell') NOT NULL,
    amount DECIMAL(15, 8) NOT NULL,
    coins DECIMAL(15, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table pour le marché
CREATE TABLE market (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crypto_price DECIMAL(10, 2) NOT NULL,
    total_supply DECIMAL(15, 8) NOT NULL,
    remaining_supply DECIMAL(15, 8) NOT NULL
);

-- Initialiser le marché avec les données de départ
INSERT INTO market (crypto_price, total_supply, remaining_supply)
VALUES (10.00, 1000000.00000000, 1000000.00000000);
