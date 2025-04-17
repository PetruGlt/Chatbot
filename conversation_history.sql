CREATE TABLE conversation_history (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
conversation_id INT NOT NULL,
question TEXT NOT NULL,
answer TEXT NOT NULL
);
