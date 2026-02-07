CREATE TABLE `deviceFingerprints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fingerprint` varchar(255) NOT NULL,
	`hasVoted` int NOT NULL DEFAULT 0,
	`lastVoteAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deviceFingerprints_id` PRIMARY KEY(`id`),
	CONSTRAINT `deviceFingerprints_fingerprint_unique` UNIQUE(`fingerprint`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`team` varchar(255) NOT NULL,
	`imageUrl` text,
	`position` varchar(100),
	`number` int,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `players_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerId` int NOT NULL,
	`deviceFingerprint` varchar(255) NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `votes_id` PRIMARY KEY(`id`)
);
