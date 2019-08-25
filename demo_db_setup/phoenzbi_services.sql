SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;

CREATE TABLE `usr_login` (
  `usr_id` bigint(20) UNSIGNED NOT NULL,
  `usr_first_name` varchar(50) NOT NULL,
  `usr_middle_name` varchar(50) NOT NULL,
  `usr_last_name` varchar(50) NOT NULL,
  `usr_designation` varchar(255) NOT NULL,
  `usr_department` varchar(255) NOT NULL,
  `usr_email` varchar(254) NOT NULL,
  `usr_phone` varchar(13) NOT NULL,
  `usr_pass` varchar(60) NOT NULL,
  `usr_date_created` bigint(10) UNSIGNED NOT NULL,
  `org_id` bigint(20) UNSIGNED NOT NULL,
  `usr_is_admin` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
  `usr_post_login` text NOT NULL,
  `usr_added_by` bigint(20) UNSIGNED NOT NULL,
  `usr_added_from_ua` text NOT NULL,
  `usr_force_pw_change` tinyint(1) UNSIGNED NOT NULL,
  `usr_access` text NOT NULL,
  `usr_is_active` tinyint(1) UNSIGNED NOT NULL,
  `usr_report_to` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `usr_login` VALUES(1, 'Mubaraque', '', 'Hussain', '', '', 'mubaraque.nalanda@gmail.com', '9090753679', '$2y$10$aeibBZ0K8/GwhFkkA/LFsOBsxCmg5pjT56Bks2PA7jzBvlNM7JLlW', 1449139636, 1, 1, 'http://datoms.phoenixrobotix.com/enterprise/##CLEP_SLUG##/sales', 0, '', 0, '[{\"service_id\":1,\"organization_specific_access_details\":[{\"organization_id\":\"*\",\"access_details\":\"*\"}]},{\"service_id\":5,\"organization_specific_access_details\":[{\"organization_id\":\"1\",\"access_details\":\"*\"}]},{\"service_id\":10,\"organization_specific_access_details\":[{\"organization_id\":\"1\",\"access_details\":\"*\"}]},{\"service_id\":7,\"organization_specific_access_details\":[{\"organization_id\":\"1\",\"access_details\":\"*\"}]},{\"service_id\":8,\"organization_specific_access_details\":[{\"organization_id\":\"1\",\"access_details\":\"*\"}]},{\"service_id\":\"4\",\"organization_specific_access_details\":[{\"organization_id\":\"1\",\"access_details\":\"*\"}]}]', 1, NULL);
INSERT INTO `usr_login` VALUES(2, 'Ashutosha', '', 'Sarangi', '', '', 'ashutosh@phoenixrobotix.com', '9438542576', '$2y$10$EjBpsc0LulGMPdQGTiIPuu383TCo/dxXXkQGYEQBG8oPScL7/ATV.', 1449223379, 1, 0, 'http://datoms.phoenixrobotix.com/enterprise/##CLEP_SLUG##/sales', 0, '', 0, '[{\"service_id\":1,\"organization_specific_access_details\":[{\"organization_id\":\"1\",\"access_details\":\"*\"}]},{\"service_id\":5,\"organization_specific_access_details\":[{\"organization_id\":\"1\",\"access_details\":\"*\"}]},{\"service_id\":\"4\",\"organization_specific_access_details\":[{\"organization_id\":\"1\",\"access_details\":\"*\"}]},{\"service_id\":\"7\",\"organization_specific_access_details\":[{\"organization_id\":1,\"access_details\":{\"add_report\":true,\"review_report\":true}}]}]', 1, NULL);
INSERT INTO `usr_login` VALUES(3, 'Suman', 'Kumar', 'Paul', '', '', 'smnkumarpaul@gmail.com', '9830420860', '$2y$10$asCgmccVDa.uLyEImxISreGLcJFADMJisrN/NB.Rnn6S7v/1QhW4G', 1502370196, 1, 0, '//datoms.phoenixrobotix.com/enterprise/##CLEP_SLUG##/pollution-monitoring/dashboard', 41, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36', 0, '[{\"service_id\":\"1\",\"organization_specific_access_details\":[{\"organization_id\":1,\"access_details\":\"*\"}]}]', 1, NULL);
INSERT INTO `usr_login` VALUES(4, 'Nemo 1', '', 'Nobody', ' Demo Designation', 'Demo ', 'abc4@gmail.com', '9830420670', '', 1525519591, 1, 0, '', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36', 1, '', 1, NULL);

CREATE TABLE `usr_deleted_accounts` (
  `usr_id` bigint(20) UNSIGNED NOT NULL,
  `usrdel_first_name` varchar(50) NOT NULL,
  `usrdel_middle_name` varchar(50) NOT NULL,
  `usrdel_last_name` varchar(50) NOT NULL,
  `usrdel_designation` varchar(255) NOT NULL,
  `usrdel_department` varchar(255) NOT NULL,
  `usrdel_email` varchar(254) NOT NULL,
  `usrdel_phone` varchar(13) NOT NULL,
  `usrdel_pass` varchar(60) NOT NULL,
  `usrdel_date_created` bigint(10) UNSIGNED NOT NULL,
  `org_id` bigint(20) UNSIGNED NOT NULL,
  `usrdel_is_admin` tinyint(1) UNSIGNED NOT NULL,
  `usrdel_post_login` text NOT NULL,
  `usrdel_added_by` bigint(20) UNSIGNED NOT NULL,
  `usrdel_added_from_ua` text NOT NULL,
  `usrdel_access` text NOT NULL,
  `usrdel_report_to` bigint(20) UNSIGNED DEFAULT NULL,
  `usrdel_deleted_by` bigint(20) UNSIGNED NOT NULL,
  `usrdel_deleted_at` bigint(10) UNSIGNED NOT NULL,
  `usrdel_deleted_from_ua` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `usr_deleted_accounts` VALUES(4, 'Nemo 1', '', 'Nobody', ' Demo Designation', 'Demo ', 'abc4@gmail.com', '9830420670', '', 1525519591, 1, 0, '', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36', '', NULL, 1, 1525767993, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36');

CREATE TABLE `usr_sessions` (
  `usrs_session_id` varchar(100) NOT NULL,
  `usrs_session_data` text NOT NULL,
  `usrs_login_time` bigint(10) UNSIGNED NOT NULL,
  `usrs_logout_time` bigint(10) UNSIGNED NOT NULL,
  `usr_id` bigint(20) UNSIGNED NOT NULL,
  `usrs_login_ip` varchar(50) NOT NULL,
  `usrs_login_from_ua` text NOT NULL,
  `usrs_logout_reason` tinyint(1) UNSIGNED NOT NULL COMMENT '1 -> User Logout, 2 -> Automatic Logout After Timeout, 3 -> Password Changed, 4 -> Updated Forgot Password',
  `usrs_login_from_app` tinyint(3) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `usr_login`
  ADD PRIMARY KEY (`usr_id`),
  ADD KEY `org_id` (`org_id`);


ALTER TABLE `usr_login`
  MODIFY `usr_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

UPDATE `usr_login` SET org_id = 365 WHERE 1;

COMMIT;
