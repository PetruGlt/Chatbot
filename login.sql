DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
                         `username` varchar(30) NOT NULL,
                         `password` varchar(50) NOT NULL,
                         `access` ENUM('USER', 'EXPERT') NOT NULL,
                         PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
