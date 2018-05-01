#!/bin/bash

# Edit these values as necessary
MYSQL_COMMAND="mysql"
MYSQL_HOST="localhost"
MYSQL_USER_NAME="root"  
MYSQL_PASSWORD="1234"

DATABASE_NAME="meet_manager"
USER_TABLE_NAME="user"
ATTENDANCE_TABLE_NAME="attendance"
EVENTS_TABLE_NAME="events"
MEETS_TABLE_NAME="meets"
RESULTS_TABLE_NAME="results"
RUNNERS_TABLE_NAME="runners"

"$MYSQL_COMMAND" -h "$MYSQL_HOST" -u "$MYSQL_USER_NAME" --password="$MYSQL_PASSWORD"  << END_OF_MEETMANAGER_DB_SCRIPT
  CREATE DATABASE $DATABASE_NAME;
  USE $DATABASE_NAME;
  CREATE TABLE $USER_TABLE_NAME (
  id int(11) NOT NULL AUTO_INCREMENT,
  username varchar(127) COLLATE utf8mb4_unicode_ci NOT NULL,
  encrypted_password varchar(127) COLLATE utf8mb4_unicode_ci NOT NULL,
  salt char(127) COLLATE utf8mb4_unicode_ci NOT NULL,
  team_name varchar(255) NOT NULL,
  UNIQUE (username),
  PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  CREATE TABLE $EVENTS_TABLE_NAME (
  event_id int(11) NOT NULL AUTO_INCREMENT,
  meet_id int(11) NOT NULL,
  event_name varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  event_gender varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  scored tinyint(1) NOT NULL,
  PRIMARY KEY (event_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  CREATE TABLE $MEETS_TABLE_NAME (
  meet_id int(11) NOT NULL AUTO_INCREMENT,
  meet_name varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  meet_date varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  meet_location varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  meet_type varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  team_name varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  accepting_entries tinyint(1) NOT NULL,
  PRIMARY KEY (meet_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  CREATE TABLE $RESULTS_TABLE_NAME (
  event_id int(11) NOT NULL,
  runner_id int(11) NOT NULL,
  seed_mins int(11) NOT NULL,
  seed_secs int(11) NOT NULL,
  seed_millis int(11) NOT NULL,
  result_mins int(11) NOT NULL,
  result_secs int(11) NOT NULL,
  result_millis int(11) NOT NULL,
  team_name varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  points int(11) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  CREATE TABLE $RUNNERS_TABLE_NAME (
  runner_id int(11) NOT NULL AUTO_INCREMENT,
  runner_name varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  runner_grade int(11) NOT NULL,
  team_name varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (runner_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  CREATE TABLE $ATTENDANCE_TABLE_NAME (
  meet_id int(11) NOT NULL AUTO_INCREMENT,
  team_name varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  points int(11) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

END_OF_MEETMANAGER_DB_SCRIPT