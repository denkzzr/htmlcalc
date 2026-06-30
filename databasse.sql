												
DROP DATABASE IF EXISTS calculator_db;
CREATE DATABASE calculator_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE calculator_db;

CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE calculations (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT          NOT NULL,
    expression    VARCHAR(255) NOT NULL,   -- например: "12 + 7"
    operator      VARCHAR(5)   NOT NULL,   -- "+", "-", "*", "/"
    operand_a     DECIMAL(20,6) NOT NULL,
    operand_b     DECIMAL(20,6) NOT NULL,
    result        DECIMAL(20,6) NULL,      -- NULL, если была ошибка
    is_error      BOOLEAN      NOT NULL DEFAULT FALSE,
    error_message VARCHAR(100) NULL,       -- например: "Деление на ноль"
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_calculations_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_calculations_user_id   ON calculations(user_id);
CREATE INDEX idx_calculations_created   ON calculations(created_at);


INSERT INTO users (username, email) VALUES
    ('ivan_petrov',   'ivan.petrov@example.com'),
    ('anna_smirnova', 'anna.smirnova@example.com');

INSERT INTO calculations
    (user_id, expression, operator, operand_a, operand_b, result, is_error, error_message)
VALUES
    (1, '12 + 7',   '+', 12,  7,   19,   FALSE, NULL),
    (1, '50 - 18',  '-', 50,  18,  32,   FALSE, NULL),
    (1, '6 * 9',    '*', 6,   9,   54,   FALSE, NULL),
    (1, '10 / 0',   '/', 10,  0,   NULL, TRUE,  'Деление на ноль'),
    (2, '100 / 4',  '/', 100, 4,   25,   FALSE, NULL),
    (2, '15 * 15',  '*', 15,  15,  225,  FALSE, NULL),
    (2, '7 - 20',   '-', 7,   20,  -13,  FALSE, NULL);


SELECT expression, result, created_at
FROM calculations
WHERE user_id = 1
ORDER BY created_at DESC;

SELECT u.username, c.expression, c.error_message, c.created_at
FROM calculations c
JOIN users u ON u.id = c.user_id
WHERE c.is_error = TRUE;

SELECT u.username, COUNT(c.id) AS total_calculations
FROM users u
LEFT JOIN calculations c ON c.user_id = u.id
GROUP BY u.id, u.username;
