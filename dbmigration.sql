CREATE TABLE `daily_quests` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userID` VARCHAR(20) NOT NULL,
  `quest_type` VARCHAR(50) NOT NULL,
  `objective` INT NOT NULL,
  `progress` INT NOT NULL DEFAULT 0,
  `reward` INT NOT NULL,
  `reset_date` DATE NOT NULL,
  PRIMARY KEY (`id`)
);