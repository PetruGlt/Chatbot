CREATE TABLE conversation_history (
id INT AUTO_INCREMENT PRIMARY KEY,
user TEXT NOT NULL,
conversation_id INT NOT NULL,
question TEXT NOT NULL,
answer TEXT NOT NULL
);

ALTER TABLE conversation_history
ADD COLUMN updated_response TEXT,
ADD COLUMN checked BOOLEAN DEFAULT FALSE;

ALTER TABLE conversation_history
ADD column trained boolean default FALSE;

