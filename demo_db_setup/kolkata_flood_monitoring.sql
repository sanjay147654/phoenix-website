SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;

CREATE TABLE `flood_monitoring_stations` (
  `fms_id` bigint(20) NOT NULL,
  `fms_sub_cat_id` bigint(20) DEFAULT NULL,
  `fms_name` varchar(100) NOT NULL,
  `fms_slug` varchar(250) NOT NULL,
  `fms_lat` double NOT NULL,
  `fms_long` double NOT NULL,
  `fms_street` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `fms_city` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `fms_state` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `fms_country` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `fms_param_list` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `fms_lst_data` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `fms_lst_dat_srv_time` bigint(10) NOT NULL,
  `idev_id` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `fms_lst_dat_time` bigint(10) NOT NULL,
  `fms_dev_status` tinyint(3) NOT NULL COMMENT '0 -> working fine, 1-> RS-485 Read Error, 2-> 4 - 20 mA Data Error',
  `fms_dev_status_last_updated` bigint(10) NOT NULL,
  `fms_send_data_to_phoenixrobotix` tinyint(1) NOT NULL,
  `fms_status` tinyint(1) NOT NULL,
  `fms_is_active` tinyint(1) NOT NULL,
  `fms_sim_mob_num` bigint(10) NOT NULL,
  `fms_sim_serial_num` varchar(100) NOT NULL,
  `fms_sim_operator` varchar(50) NOT NULL,
  `fms_added_by` bigint(20) NOT NULL,
  `fms_added_at` bigint(10) NOT NULL,
  `fms_added_from_ua` text NOT NULL,
  `fms_instl_done_by` varchar(256) NOT NULL,
  `fms_instl_done_at` bigint(10) NOT NULL,
  `fms_instl_done_from_ua` text NOT NULL,
  `fms_approved_by` bigint(20) NOT NULL,
  `fms_approved_at` bigint(10) NOT NULL,
  `fms_approved_from_ua` text NOT NULL,
  `fms_analyser_status_flag` tinyint(1) NOT NULL,
  `fms_image_path` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `flood_monitoring_stations` VALUES(1, 1, 'Demo Station 1', 'demo-station-1', 22.5757803, 88.3764019, 'Narkeldanga Main Road, Garpar, RajaBazar', 'Kolkata', 'West Bengal', 'India', '[{\"name\":\"PM<sub>2.5</sub>\",\"key\":\"pm25\",\"unit\":\"ppm\"},{\"name\":\"PM<sub>10</sub>\",\"key\":\"pm10\",\"unit\":\"ppm\"},{\"name\":\"Temperature\",\"key\":\"temp\",\"unit\":\"°C\"},{\"name\":\"Humidity\",\"key\":\"humidity\",\"unit\":\"%\"}]', '{\"pm25\":83,\"pm10\":103,\"temp\":39,\"humidity\":76}', 1533963194, '[1]', 1533963194, 0, 0, 0, 0, 0, 0, '', '', 0, 1530383400, '', '', 0, '', 0, 0, '', 0, '');
INSERT INTO `flood_monitoring_stations` VALUES(2, 1, 'Demo Station 2', 'demo-station-2', 22.6300147, 88.4455714, 'Rajarhat Rd, Dash Drone, Newtown', 'Kolkata', 'West Bengal', 'India', '[{\"name\":\"PM<sub>2.5</sub>\",\"key\":\"pm25\",\"unit\":\"ppm\"},{\"name\":\"PM<sub>10</sub>\",\"key\":\"pm10\",\"unit\":\"ppm\"},{\"name\":\"Temperature\",\"key\":\"temp\",\"unit\":\"°C\"},{\"name\":\"Humidity\",\"key\":\"humidity\",\"unit\":\"%\"}]', '{\"pm25\":167,\"pm10\":257,\"temp\":35,\"humidity\":69}', 1533963194, '[2]', 1533963194, 0, 0, 0, 0, 0, 0, '', '', 0, 1530383400, '', '', 0, '', 0, 0, '', 0, '');
INSERT INTO `flood_monitoring_stations` VALUES(3, 2, 'Demo Station 3', 'demo-station-3', 22.6246786, 88.440115, 'Rajarhat Rd, Atghara, Tegharia, Dakhin Mart Kaikhalii', 'Kolkata', 'West Bengal', 'India', '[{\"name\":\"PM<sub>2.5</sub>\",\"key\":\"pm25\",\"unit\":\"ppm\"},{\"name\":\"PM<sub>10</sub>\",\"key\":\"pm10\",\"unit\":\"ppm\"},{\"name\":\"Temperature\",\"key\":\"temp\",\"unit\":\"°C\"},{\"name\":\"Humidity\",\"key\":\"humidity\",\"unit\":\"%\"}]', '{\"pm25\":52,\"pm10\":9,\"temp\":11,\"humidity\":58}', 1533963194, '[3]', 1533963194, 0, 0, 0, 0, 0, 0, '', '', 0, 1530383400, '', '', 0, '', 0, 0, '', 0, '');
INSERT INTO `flood_monitoring_stations` VALUES(4, 2, 'Demo Station 4', 'demo-station-4', 22.6228177, 88.4424723, 'NH12,Chinar Park, Noapara, Sukanta Pally', 'Kolkata', 'West Bengal', 'India', '[{\"name\":\"PM<sub>2.5</sub>\",\"key\":\"pm25\",\"unit\":\"ppm\"},{\"name\":\"PM<sub>10</sub>\",\"key\":\"pm10\",\"unit\":\"ppm\"},{\"name\":\"Temperature\",\"key\":\"temp\",\"unit\":\"°C\"},{\"name\":\"Humidity\",\"key\":\"humidity\",\"unit\":\"%\"}]', '{\"pm25\":282,\"pm10\":206,\"temp\":42,\"humidity\":45}', 1533966794, '[4]', 1533966794, 0, 0, 0, 0, 0, 0, '', '', 0, 1530383400, '', '', 0, '', 0, 0, '', 0, '');
INSERT INTO `flood_monitoring_stations` VALUES(5, 4, 'Demo Station 5', 'demo-station-5', 22.6203406, 88.4565572, 'NH12, Action Area IIE, Newtown, New Town', 'Kolkata', 'West Bengal', 'India', '[\r\n  {\r\n    \"name\": \"Rainfall\",\r\n    \"key\": \"rain\",\r\n    \"unit\": \"mm\",\r\n    \"type\": \"rainfall\"\r\n  },\r\n  {\r\n    \"name\": \"Penstock\",\r\n    \"key\": \"pstock\",\r\n    \"unit\": \"m\",\r\n    \"type\": \"penstock_level\",\r\n    \"threshold\": {\r\n      \"max\": 100,\r\n      \"min\": 10\r\n    }\r\n  },\r\n  {\r\n    \"name\": \"Sump\",\r\n    \"key\": \"sump\",\r\n    \"unit\": \"m\",\r\n    \"type\": \"sump_level\",\r\n    \"threshold\": {\r\n      \"max\": 100,\r\n      \"min\": 10\r\n    }\r\n  },\r\n  {\r\n    \"name\": \"Pump - 1\",\r\n    \"key\": \"p1\",\r\n    \"type\": \"pump_status\",\r\n    \"unit\": \"\"\r\n  },\r\n  {\r\n    \"name\": \"Pump - 2\",\r\n    \"key\": \"p2\",\r\n    \"type\": \"pump_status\",\r\n    \"unit\": \"\"\r\n  },\r\n  {\r\n    \"name\": \"Pump - 3\",\r\n    \"key\": \"p3\",\r\n    \"type\": \"pump_status\",\r\n    \"unit\": \"\"\r\n  }\r\n]', '{\"rain\":{\"min\":2,\"max\":16,\"avg\":2,\"min_at\":1533963901,\"max_at\":1533965032},\"pstock\":224,\"sump\":101,\"p1\":\"OFF\",\"p2\":\"ON\",\"p3\":\"OFF\"}', 1533966794, '[5,6]', 1533966794, 0, 0, 0, 0, 0, 0, '', '', 0, 1530383400, '', '', 0, '', 0, 0, '', 0, '');
INSERT INTO `flood_monitoring_stations` VALUES(6, 4, 'Demo Station 6', 'demo-station-6', 22.6086997, 88.4668483, 'NH12,Jatragachhi,Deshbandhu Nagar, New Town', 'Kolkata', 'West Bengal', 'India', '[\r\n  {\r\n    \"name\": \"Rainfall\",\r\n    \"key\": \"rain\",\r\n    \"unit\": \"mm\",\r\n    \"type\": \"rainfall\"\r\n  },\r\n  {\r\n    \"name\": \"Penstock\",\r\n    \"key\": \"pstock\",\r\n    \"unit\": \"m\",\r\n    \"type\": \"penstock_level\",\r\n    \"threshold\": {\r\n      \"max\": 100,\r\n      \"min\": 10\r\n    }\r\n  },\r\n  {\r\n    \"name\": \"Sump\",\r\n    \"key\": \"sump\",\r\n    \"unit\": \"m\",\r\n    \"type\": \"sump_level\",\r\n    \"threshold\": {\r\n      \"max\": 100,\r\n      \"min\": 10\r\n    }\r\n  },\r\n  {\r\n    \"name\": \"Pump - 1\",\r\n    \"key\": \"p1\",\r\n    \"type\": \"pump_status\",\r\n    \"unit\": \"\"\r\n  },\r\n  {\r\n    \"name\": \"Pump - 2\",\r\n    \"key\": \"p2\",\r\n    \"type\": \"pump_status\",\r\n    \"unit\": \"\"\r\n  },\r\n  {\r\n    \"name\": \"Pump - 3\",\r\n    \"key\": \"p3\",\r\n    \"type\": \"pump_status\",\r\n    \"unit\": \"\"\r\n  }\r\n]', '{\"rain\":{\"min\":6,\"max\":17,\"avg\":6,\"min_at\":1533966094,\"max_at\":1533966409},\"pstock\":295,\"sump\":28,\"p1\":\"ON\",\"p2\":\"OFF\",\"p3\":\"OFF\"}', 1533966794, '[7,8]', 1533966794, 0, 0, 0, 0, 0, 0, '', '', 0, 1530383400, '', '', 0, '', 0, 0, '', 0, '');
INSERT INTO `flood_monitoring_stations` VALUES(7, 4, 'Demo Station 7', 'demo-station-7', 22.6634793, 88.376118, 'SH 2, Rathtala, Santhi Nagra Colony, Belghoria', 'Kolkata', 'West Bengal', 'India', '[\r\n  {\r\n    \"name\": \"Rainfall\",\r\n    \"key\": \"rain\",\r\n    \"unit\": \"mm\",\r\n    \"type\": \"rainfall\"\r\n  },\r\n  {\r\n    \"name\": \"Penstock\",\r\n    \"key\": \"pstock\",\r\n    \"unit\": \"m\",\r\n    \"type\": \"penstock_level\",\r\n    \"threshold\": {\r\n      \"max\": 100,\r\n      \"min\": 10\r\n    }\r\n  },\r\n  {\r\n    \"name\": \"Sump\",\r\n    \"key\": \"sump\",\r\n    \"unit\": \"m\",\r\n    \"type\": \"sump_level\",\r\n    \"threshold\": {\r\n      \"max\": 100,\r\n      \"min\": 10\r\n    }\r\n  },\r\n  {\r\n    \"name\": \"Pump - 1\",\r\n    \"key\": \"p1\",\r\n    \"type\": \"pump_status\",\r\n    \"unit\": \"\"\r\n  },\r\n  {\r\n    \"name\": \"Pump - 2\",\r\n    \"key\": \"p2\",\r\n    \"type\": \"pump_status\",\r\n    \"unit\": \"\"\r\n  },\r\n  {\r\n    \"name\": \"Pump - 3\",\r\n    \"key\": \"p3\",\r\n    \"type\": \"pump_status\",\r\n    \"unit\": \"\"\r\n  }\r\n]', '{\"rain\":{\"min\":3,\"max\":16,\"avg\":10,\"min_at\":1533962588,\"max_at\":1533962209},\"pstock\":185,\"sump\":35,\"p1\":\"OFF\",\"p2\":\"OFF\",\"p3\":\"OFF\"}', 1533963194, '[9,10]', 1533963194, 0, 0, 0, 0, 0, 0, '', '', 0, 1530383400, '', '', 0, '', 0, 0, '', 0, '');
INSERT INTO `flood_monitoring_stations` VALUES(8, 4, 'Demo Station 8', 'demo-station-8', 22.6588844, 88.3747209, 'SH 2,Santhi Nagra Colony, Belghoria', 'Kolkata', 'West Bengal', 'India', '[\r\n  {\r\n    \"name\": \"Rainfall\",\r\n    \"key\": \"rain\",\r\n    \"unit\": \"mm\",\r\n    \"type\": \"rainfall\"\r\n  },\r\n  {\r\n    \"name\": \"Penstock\",\r\n    \"key\": \"pstock\",\r\n    \"unit\": \"m\",\r\n    \"type\": \"penstock_level\",\r\n    \"threshold\": {\r\n      \"max\": 100,\r\n      \"min\": 10\r\n    }\r\n  },\r\n  {\r\n    \"name\": \"Sump\",\r\n    \"key\": \"sump\",\r\n    \"unit\": \"m\",\r\n    \"type\": \"sump_level\",\r\n    \"threshold\": {\r\n      \"max\": 100,\r\n      \"min\": 10\r\n    }\r\n  },\r\n  {\r\n    \"name\": \"Pump - 1\",\r\n    \"key\": \"p1\",\r\n    \"type\": \"pump_status\",\r\n    \"unit\": \"\"\r\n  },\r\n  {\r\n    \"name\": \"Pump - 2\",\r\n    \"key\": \"p2\",\r\n    \"type\": \"pump_status\",\r\n    \"unit\": \"\"\r\n  },\r\n  {\r\n    \"name\": \"Pump - 3\",\r\n    \"key\": \"p3\",\r\n    \"type\": \"pump_status\",\r\n    \"unit\": \"\"\r\n  }\r\n]', '{\"rain\":{\"min\":0,\"max\":10,\"avg\":7,\"min_at\":1533964157,\"max_at\":1533965985},\"pstock\":47,\"sump\":284,\"p1\":\"ON\",\"p2\":\"ON\",\"p3\":\"OFF\"}', 1533966794, '[11,12]', 1533966794, 0, 0, 0, 0, 0, 0, '', '', 0, 1530383400, '', '', 0, '', 0, 0, '', 0, '');
INSERT INTO `flood_monitoring_stations` VALUES(9, 5, 'Demo Station 9', 'demo-station-9', 22.6541119, 88.3766263, 'SH 2, Dunlop, UB Colony, Ashokgarh', 'Kolkata', 'West Bengal', 'India', '[{\"name\":\"Water Level\",\"key\":\"us_mb\",\"unit\":\"cm\",\"device_id\":\"671\",\"type\":\"open_canal_water_level\"}]\r\n', '{\"us_mb\":133}', 1533966794, '[13]', 1533966794, 0, 0, 0, 0, 0, 0, '', '', 0, 1530383400, '', '', 0, '', 0, 0, '', 0, '');
INSERT INTO `flood_monitoring_stations` VALUES(10, 6, 'Demo Station 10', 'demo-station-10', 22.5168624, 88.3465972, 'Rash Behari Ave, Manoharpukur, Kalighat', 'Kolkata', 'West Bengal', 'India', '[{\"name\":\"Level - 1\",\"key\":\"us_mb\",\"unit\":\"cm\",\"device_id\":\"675\",\"type\":\"gated_canal_water_level_1\"}]\r\n', '{\"us_mb\":218}', 1533966794, '[14]', 1533966794, 0, 0, 0, 0, 0, 0, '', '', 0, 1530383400, '', '', 0, '', 0, 0, '', 0, '');

CREATE TABLE `flood_monitoring_stations_hourly_data` (
  `fms_id` bigint(20) NOT NULL,
  `fms_hd_time` bigint(10) NOT NULL,
  `fms_hd_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `flood_monitoring_stations_notification` (
  `fms_id` bigint(20) UNSIGNED NOT NULL,
  `fmsn_time` bigint(10) UNSIGNED NOT NULL,
  `fmsn_text` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `flood_monitoring_stations_notification` VALUES(4, 1532511816, 'First Event Generated');
INSERT INTO `flood_monitoring_stations_notification` VALUES(5, 1532511816, 'First Event Generated');
INSERT INTO `flood_monitoring_stations_notification` VALUES(6, 1532519816, 'First Event Generated');
INSERT INTO `flood_monitoring_stations_notification` VALUES(4, 1532521816, 'Another Event generated');
INSERT INTO `flood_monitoring_stations_notification` VALUES(5, 1532512816, 'Another Event Generated');
INSERT INTO `flood_monitoring_stations_notification` VALUES(6, 1532512816, 'Another Event Generated');
INSERT INTO `flood_monitoring_stations_notification` VALUES(4, 1532511816, 'Another Event Generated');
INSERT INTO `flood_monitoring_stations_notification` VALUES(5, 153251816, 'Last Event Generated');
INSERT INTO `flood_monitoring_stations_notification` VALUES(6, 1532581816, 'Last Event Generated');
INSERT INTO `flood_monitoring_stations_notification` VALUES(4, 1532591816, 'Last Event Generated');

CREATE TABLE `flood_monitoring_stations_raw_data` (
  `fms_id` bigint(20) NOT NULL,
  `fms_rd_time` bigint(10) NOT NULL,
  `fms_rd_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `flood_monitoring_station_categories` (
  `fms_cat_id` bigint(20) NOT NULL,
  `fms_cat_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `flood_monitoring_station_categories` VALUES(1, 'Air Quality');
INSERT INTO `flood_monitoring_station_categories` VALUES(2, 'Flood');
INSERT INTO `flood_monitoring_station_categories` VALUES(3, 'Vehicle');

CREATE TABLE `flood_monitoring_station_parameters` (
  `fms_prm_id` bigint(20) NOT NULL,
  `fms_prm_name` varchar(250) NOT NULL,
  `fms_prm_key` varchar(10) NOT NULL,
  `fms_prm_unit` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `flood_monitoring_station_sub_categories` (
  `fms_sub_cat_id` bigint(20) NOT NULL,
  `fms_sub_cat_name` varchar(50) NOT NULL,
  `fms_cat_id` bigint(20) NOT NULL,
  `fms_sub_cat_params` text NOT NULL,
  `fms_sub_cat_show_trend` tinyint(2) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `flood_monitoring_station_sub_categories` VALUES(1, 'Major Road Junction', 1, '[{\"name\":\"PM<sub>2.5</sub>\",\"key\":\"pm25\",\"unit\":\"ppm\"},{\"name\":\"PM<sub>10</sub>\",\"key\":\"pm10\",\"unit\":\"ppm\"},{\"name\":\"Temperature\",\"key\":\"temp\",\"unit\":\"°C\"},{\"name\":\"Humidity\",\"key\":\"humidity\",\"unit\":\"%\"}]', 1);
INSERT INTO `flood_monitoring_station_sub_categories` VALUES(2, 'Street / Sub / House Front', 1, '[{\"name\":\"PM<sub>2.5</sub>\",\"key\":\"pm25\",\"unit\":\"ppm\"},{\"name\":\"PM<sub>10</sub>\",\"key\":\"pm10\",\"unit\":\"ppm\"},{\"name\":\"Temperature\",\"key\":\"temp\",\"unit\":\"°C\"},{\"name\":\"Humidity\",\"key\":\"humidity\",\"unit\":\"%\"}]', 1);
INSERT INTO `flood_monitoring_station_sub_categories` VALUES(4, 'Pump Station', 2, '[ {   \"name\": \"Rainfall\",   \"key\": \"rain\",   \"unit\": \"mm\" }, {   \"name\": \"Penstock\",   \"key\": \"pstock\",   \"unit\": \"m\",   \"threshold\": {     \"max\": 100,     \"min\": 10   } }, {   \"name\": \"Sump\",   \"key\": \"sump\",   \"unit\": \"m\",   \"threshold\": {     \"max\": 100,     \"min\": 10   } }]', 1);
INSERT INTO `flood_monitoring_station_sub_categories` VALUES(5, 'Open Canal', 2, '[{\"name\":\"Water Level\",\"key\":\"w_level\",\"unit\":\"m\"}]', 1);
INSERT INTO `flood_monitoring_station_sub_categories` VALUES(6, 'Gated Canal', 2, '[{\"name\":\"Inlet\",\"key\":\"inlet\",\"unit\":\"m\"},{\"name\":\"Outlet\",\"key\":\"outlet\",\"unit\":\"m\"}]', 1);
INSERT INTO `flood_monitoring_station_sub_categories` VALUES(7, 'Major Road Junction', 2, '[{\"name\":\"Water Level\",\"key\":\"w_level\",\"unit\":\"m\"}]', 1);
INSERT INTO `flood_monitoring_station_sub_categories` VALUES(8, 'Street / Sub / House Front', 2, '[{\"name\":\"Water Level\",\"key\":\"w_level\",\"unit\":\"cm\"}]', 1);
INSERT INTO `flood_monitoring_station_sub_categories` VALUES(9, 'Bus', 3, '[{\"name\": \"Vehicle Status\",\"key\": \"v_status\",\"unit\": \"\"},{\"name\": \"Distance\",\"key\": \"distance\",\"unit\": \"km\"},{\"name\": \"lng\",\"key\": \"long\",\"unit\": \"\"},{\"name\": \"lat\",\"key\": \"lat\",\"unit\": \"\"}]', 1);

CREATE TABLE `iot_devices` (
  `idev_id` bigint(20) NOT NULL,
  `idev_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `idev_qr_code` varchar(256) NOT NULL,
  `idev_auth_token` varchar(256) NOT NULL,
  `idev_is_active` tinyint(1) UNSIGNED NOT NULL COMMENT '0 -> No, 1 -> Yes',
  `idev_created_at` bigint(10) UNSIGNED NOT NULL,
  `idev_added_to_vendor_by` bigint(20) UNSIGNED NOT NULL,
  `idev_added_to_vendor_at` bigint(10) UNSIGNED NOT NULL,
  `idev_added_to_vendor_from_ua` text NOT NULL,
  `idev_added_to_customer_by` bigint(20) UNSIGNED NOT NULL,
  `idev_added_to_customer_at` bigint(10) UNSIGNED NOT NULL,
  `idev_added_to_customer_from_ua` text NOT NULL,
  `idct_id` bigint(20) UNSIGNED NOT NULL,
  `vendor_id` bigint(20) UNSIGNED NOT NULL,
  `industry_id` bigint(20) UNSIGNED NOT NULL DEFAULT '0',
  `idev_imei_no` varchar(50) NOT NULL,
  `idev_firmware_version` varchar(11) NOT NULL,
  `idev_circuit_version` varchar(11) NOT NULL,
  `idt_id` tinyint(3) UNSIGNED NOT NULL,
  `last_online_time` bigint(10) UNSIGNED NOT NULL,
  `last_data_receive_time` bigint(10) UNSIGNED NOT NULL,
  `idev_data_status` tinyint(1) NOT NULL,
  `last_raw_data` text NOT NULL,
  `serv_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT '0 -> Unassigned, 1 -> Pollution Monitoring, 2 -> Energy Monitoring',
  `idev_data_sending_configurations` text NOT NULL,
  `idev_configurations` text NOT NULL,
  `idev_config_sync_msgs` text NOT NULL,
  `idev_station_list` text NOT NULL,
  `idev_latitude` float NOT NULL,
  `idev_longitude` float NOT NULL,
  `idev_configuration_changed_by` varchar(200) NOT NULL,
  `idev_configuration_changed_at` bigint(10) NOT NULL,
  `idev_error_detected_type` int(9) NOT NULL,
  `idev_error_detected_at` int(11) NOT NULL,
  `idev_status_change_time` bigint(10) DEFAULT NULL,
  `idev_deployed_at` bigint(10) DEFAULT NULL,
  `idev_manufactured_at` bigint(10) DEFAULT NULL,
  `idev_assembled_at` bigint(10) DEFAULT NULL,
  `idev_is_shutdown` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `iot_devices` VALUES(1, '', 'TR00000123456788', 'a1', 1, 0, 0, 0, '', 1, 1521200021, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36', 0, 1, 1, '', '', '', 2, 1513328974, 1532529000, 1, '{\"pm25\":148,\"pm10\":184,\"temp\":8,\"humidity\":24}', 1, '', '{\"transmission_interval\":60,\"sampling_interval\":60}', '', '[16]', 21.4704, 83.9379, 'suman', 1511328974, 1, 1511327974, 1511329074, 1510029074, 1510009074, 1510019074, 1);
INSERT INTO `iot_devices` VALUES(2, '', 'TR00000123456789', 'Vu6vW0sl6l4Op9wWlPyLVXWN7SIo2DZjKxq7xVUPND60oA0bPtYGw9SuNMSyezBa', 1, 0, 0, 0, '', 1, 1521200115, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36', 0, 1, 1, '', '', '', 3, 1514024627, 1532529000, 0, '{\"pm25\":126,\"pm10\":102,\"temp\":14,\"humidity\":33}', 1, '', '', '', '[0]', 22.2132, 84.7541, 'binay', 1514014627, 21, 1511318974, 1514015627, 1512015627, 1512013627, 1512014627, 0);
INSERT INTO `iot_devices` VALUES(3, '', 'TR00000123456780', 'Blnl3klmKl2aB4RK5iViaMHfnpgMEMijvrFelHDGmcnAo9qiuUbaJgexCKbLAcyi', 1, 0, 0, 0, '', 1, 1521201342, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36', 0, 1, 1, '', '', '', 4, 1514024611, 1532529000, 1, '{\"pm25\":120,\"pm10\":19,\"temp\":14,\"humidity\":50}', 1, '', '', '', '[0]', 23.5318, 87.2277, 'mubaraque', 1512024611, 3, 1512022611, 1512026611, 1510026611, 1510006611, 1510016611, 1);
INSERT INTO `iot_devices` VALUES(4, '', 'TR00000123456781', 'wJKAIOJySqHJWRKLFzxx5vzJsNLyOm34xU0u12B1H60MSBf58jS4FqCC76mPttM8', 1, 0, 0, 0, '', 1, 1521211456, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36', 0, 1, 1, '', '', '', 5, 1499756072, 1532529000, 0, '{\"pm25\":22,\"pm10\":273,\"temp\":8,\"humidity\":90}', 1, '', '', '', '[0]', 0, 0, 'biswa', 1499746072, 4, 1499744072, 1499746172, 1498746172, 1498726172, 1498736172, 0);
INSERT INTO `iot_devices` VALUES(5, '', 'TR00000123456782', 'AoymPFksajFhl5mddKpN9TLKHgTCZCSDZjLFEHwl2nO0A9NLh1OBpFWHdSL1nSXQ', 1, 0, 0, 0, '', 3, 1485323634, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36', 0, 1, 0, '', '', '', 6, 1511145016, 1532529000, 0, '{\"rain\":{\"min\":20,\"max\":52,\"avg\":42,\"min_at\":1532525910,\"max_at\":1532525422},\"pstock\":91,\"sump\":263,\"p1\":176,\"p2\":135,\"p3\":85}', NULL, '', '', '', '[0]', 23.6906, 86.0774, 'suman', 1511045016, 8, 1511044016, 1511045216, 1510045216, 1510025216, 1510035216, 1);
INSERT INTO `iot_devices` VALUES(6, '', 'TR00000123456782', 'wiZ1Rd1Sm2CSjeaYhO8W9DSXZ39cWlI0UMdYafavtFBed0DOhKs2KNoyhf8UGLLM', 1, 0, 0, 0, '', 1, 1530365476, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36', 0, 1, 0, '', '', '', 7, 1496645910, 1532529000, 0, '{\"rain\":{\"min\":42,\"max\":96,\"avg\":86,\"min_at\":1532525955,\"max_at\":1532527561},\"pstock\":241,\"sump\":281,\"p1\":206,\"p2\":37,\"p3\":259}', 0, '', '', '', '[0]', 23.6931, 86.0835, 'nago', 1496345910, 7, 1496344910, 1496346010, 1496246010, 1496226010, 1496236010, 0);
INSERT INTO `iot_devices` VALUES(7, '', 'TR00000123456782', 'PhbBMbbz1jjI4nZjrDi0T4UrDsfJKtseAr4Xmx8Dj7oXSuKb7JQf05MEIjTcl7xp', 1, 0, 0, 0, '', 3, 1485323634, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36', 0, 1, 1, 'ABCD1234', '4.0.0', '', 7, 1514016592, 1532529000, 0, '{\"rain\":{\"min\":33,\"max\":97,\"avg\":38,\"min_at\":1532526106,\"max_at\":1532528172},\"pstock\":111,\"sump\":85,\"p1\":48,\"p2\":115,\"p3\":160}', 1, '', '', '', '[11]', 21.1639, 77.0689, 'nago', 1514016592, 9, 1514014592, 1514016892, 1513016892, 1513000892, 1513006892, 1);
INSERT INTO `iot_devices` VALUES(8, '', 'TR00000123456782', 'JdvzPLGpIprfnv6yl51HgCGYZQYbsrF53DPzvplJtQKzbNclQl7AeZwnGvOW48DX', 1, 0, 0, 0, '', 3, 1485323634, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36', 0, 1, 1, '', '1.0.0', '', 7, 1514024629, 1532529000, 1, '{\"rain\":{\"min\":6,\"max\":77,\"avg\":64,\"min_at\":1532528446,\"max_at\":1532527989},\"pstock\":57,\"sump\":50,\"p1\":20,\"p2\":158,\"p3\":105}', 1, '', '{\"communication_type\":\"1\",\"data_transmission_interval\":\"60\",\"data_sampling_interval\":\"50\",\"wifi_ssid\":\"\",\"wifi_pass\":\"\",\"ss_ip\":\"\",\"ss_port\":\"\",\"device_ip\":\"\",\"subnet_mask\":\"\",\"default_gateway\":\"\",\"dns_server\":\"\"}', '', '[15,17]', 28.5272, 77.0689, 'mubaraque', 1514014629, 5, 1514012629, 1514014929, 1513014929, 1513004929, 1513009929, 0);
INSERT INTO `iot_devices` VALUES(9, 'Demo Device 1', 'PRTD001', 'rm4cuun3D0sjwVn98PA4qhTHtrxGqE5fNB9u3uhL3oQh305zEYb1ZOPGh11QWPFP', 0, 0, 41, 1498141771, '', 41, 1498141771, '', 4, 1, 1, '', '1.0.0', '', 7, 1514024585, 1532529000, 0, '{\"w_level\":141}', 15, '', '{   \"p_status\":{     \"name\": \"Penstock Status\",     \"upper_limit\": \"120\",     \"lower_limit\": \"20\"   },   \"s_status\":{     \"name\": \"Stump Status\",     \"upper_limit\": \"80\",     \"lower_limit\": \"0\"   } }', '', '[4]', 22.2132, 83.9379, 'binay', 1513024585, 6, 1513024185, 1513024985, 1512024985, 1512014985, 1512017985, 1);
INSERT INTO `iot_devices` VALUES(10, 'Demo Device 2', 'PRTD002', 'OXu6wBEmYCspPZ6VKYKYnld6X1V2FWtUnYBbgwtvytKhMBi9vKuArvH1SQOiQowd', 1, 0, 41, 1498141771, '', 41, 1498141771, '', 7, 1, 1, '', '1.0.0', '', 4, 0, 1532529000, 1, '{\"w_level\":185}', 15, '', '{ 									\"PM2.5\":{ 										multipler:1, 										offset:0 									}, 									\"PM10\":{ 										multipler:1, 										offset:0 									}, 									\"temperature\":{ 										offset:0, 										multipler:1 									}, 									\"street_flood\":{ 										base_lable:10 									} 								}', '', '[5]', 23.6931, 77.0689, 'biswa', 0, 11, 0, NULL, NULL, NULL, NULL, 0);
INSERT INTO `iot_devices` VALUES(11, '', 'TR00000123456788', 'a1', 1, 0, 0, 0, '', 1, 1521200021, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36', 0, 1, 1, '', '', '', 4, 1513328974, 1532529000, 1, '{\"inlet\":30,\"outlet\":211}', 1, '', '{\"transmission_interval\":60,\"sampling_interval\":60}', '', '[16]', 21.4704, 83.9379, 'suman', 1511328974, 1, 1511327974, 1511329074, 1510029074, 1510009074, 1510019074, 1);
INSERT INTO `iot_devices` VALUES(12, '', 'TR00000123456789', 'Vu6vW0sl6l4Op9wWlPyLVXWN7SIo2DZjKxq7xVUPND60oA0bPtYGw9SuNMSyezBa', 1, 0, 0, 0, '', 1, 1521200115, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36', 0, 1, 1, '', '', '', 3, 1514024627, 1532529000, 0, '{\"inlet\":8,\"outlet\":30}', 1, '', '', '', '[0]', 22.2132, 84.7541, 'binay', 1514014627, 21, 1511318974, 1514015627, 1512015627, 1512013627, 1512014627, 0);
INSERT INTO `iot_devices` VALUES(13, '', 'TR00000123456780', 'Blnl3klmKl2aB4RK5iViaMHfnpgMEMijvrFelHDGmcnAo9qiuUbaJgexCKbLAcyi', 1, 0, 0, 0, '', 1, 1521201342, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36', 0, 1, 1, '', '', '', 6, 1514024611, 1532529000, 1, '{\"w_level\":100}', 1, '', '', '', '[0]', 23.5318, 87.2277, 'mubaraque', 1512024611, 3, 1512022611, 1512026611, 1510026611, 1510006611, 1510016611, 1);
INSERT INTO `iot_devices` VALUES(14, '', 'TR00000123456781', 'wJKAIOJySqHJWRKLFzxx5vzJsNLyOm34xU0u12B1H60MSBf58jS4FqCC76mPttM8', 1, 0, 0, 0, '', 1, 1521211456, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36', 0, 1, 1, '', '', '', 8, 1499756072, 1532529000, 0, '{\"w_level\":240}', 1, '', '', '', '[0]', 0, 0, 'biswa', 1499746072, 4, 1499744072, 1499746172, 1498746172, 1498726172, 1498736172, 0);

CREATE TABLE `iot_device_types` (
  `idt_id` tinyint(3) UNSIGNED NOT NULL,
  `idt_name` varchar(50) NOT NULL,
  `idprtcl_id` smallint(5) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `iot_device_types` VALUES(1, 'TraDe GPRS', 1);
INSERT INTO `iot_device_types` VALUES(2, 'A', 0);
INSERT INTO `iot_device_types` VALUES(3, 'A1', 0);
INSERT INTO `iot_device_types` VALUES(4, 'B', 0);
INSERT INTO `iot_device_types` VALUES(5, 'C', 0);
INSERT INTO `iot_device_types` VALUES(6, 'D', 0);
INSERT INTO `iot_device_types` VALUES(7, 'E', 0);
INSERT INTO `iot_device_types` VALUES(8, 'F', 0);

CREATE TABLE `iot_device_connectivity_status_history` (
  `idev_id` bigint(20) UNSIGNED NOT NULL,
  `idcsh_time` bigint(10) UNSIGNED NOT NULL,
  `idcsh_status` tinyint(1) UNSIGNED NOT NULL COMMENT '0 -> Offline, 1 -> Online'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `station_groups` (
  `stgr_id` bigint(20) UNSIGNED NOT NULL,
  `serv_id` bigint(20) UNSIGNED NOT NULL,
  `clep_id` bigint(20) UNSIGNED NOT NULL,
  `stgr_name` varchar(100) NOT NULL,
  `stgr_description` text NOT NULL,
  `stgr_created_by` bigint(20) UNSIGNED NOT NULL,
  `stgr_created_at` bigint(10) UNSIGNED NOT NULL,
  `stgr_created_from` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `station_group_links` (
  `stgr_id` bigint(20) UNSIGNED NOT NULL,
  `stations_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `services_tbl` (
  `serv_id` bigint(20) UNSIGNED NOT NULL,
  `serv_name` varchar(50) NOT NULL,
  `serv_slug` varchar(50) NOT NULL,
  `latest_firmware` varchar(10) NOT NULL DEFAULT '0.0.0',
  `serv_access_list` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `services_tbl` VALUES(1, 'Pollution Monitoring', 'pollution-monitoring', '', '');
INSERT INTO `services_tbl` VALUES(2, 'Tracke', 'tracke', '', '');
INSERT INTO `services_tbl` VALUES(3, 'Weather Monitoring', 'weather-monitoring', '', '');
INSERT INTO `services_tbl` VALUES(4, 'Energy Monitoring', 'energy-monitoring', '', '');
INSERT INTO `services_tbl` VALUES(5, 'Sales', 'sales', '', '');
INSERT INTO `services_tbl` VALUES(6, 'Aurassure', 'aurassure', '', '');
INSERT INTO `services_tbl` VALUES(7, 'QC', 'qc', '', '');
INSERT INTO `services_tbl` VALUES(8, 'Purchase', 'purchase', '', '');
INSERT INTO `services_tbl` VALUES(9, 'Operations', 'operations', '', '');
INSERT INTO `services_tbl` VALUES(10, 'Sales Development', 'sales_dev', '', '');
INSERT INTO `services_tbl` VALUES(11, 'Device Management', 'device-management', '', '');
INSERT INTO `services_tbl` VALUES(12, 'IoT', 'iot', '', '');
INSERT INTO `services_tbl` VALUES(13, 'Dashboard', 'dashboard', '', '');
INSERT INTO `services_tbl` VALUES(14, 'TraDe Testing', 'trade-testing', '', '');
INSERT INTO `services_tbl` VALUES(15, 'TLP Monitoring', 'tlp-monitoring', '', '');
INSERT INTO `services_tbl` VALUES(16, 'DG Monitoring', 'dg-monitoring', '', '');
INSERT INTO `services_tbl` VALUES(17, 'IoT Platform', 'iot-platform', '', '');
INSERT INTO `services_tbl` VALUES(18, 'Cold Storage Monitoring', 'cold-storage-monitoring', '', '');
INSERT INTO `services_tbl` VALUES(19, 'Flood Monitoring', 'flood-monitoring', 'v0.1.0', '{\r\n  \"version\": \"1\",\r\n  \"access_groups\": [\r\n    {\r\n      \"group_name\": \"Access Data\",\r\n      \"group_description\": \"Access Data of various stations\",\r\n      \"access_list\": [\r\n        {\r\n          \"name\": \"Real-time Data\",\r\n          \"description\": \"Access Real-time Data of various stations.\",\r\n          \"key\": \"AccessData:RealTime\"\r\n        },\r\n        {\r\n          \"name\": \"Historical Data\",\r\n          \"description\": \"\",\r\n          \"key\": \"AccessData:HistoricalData\"\r\n        }\r\n      ]\r\n    },\r\n    {\r\n      \"group_name\": \"Advanced Analytics\",\r\n      \"group_description\": \"Access Advanced Analytics of various stations.\",\r\n      \"access_list\": [\r\n        {\r\n          \"name\": \"Forecasting\",\r\n          \"description\": \"\",\r\n          \"key\": \"AdvancedAnalytics:Forecasting\"\r\n        },\r\n        {\r\n          \"name\": \"Scenarios\",\r\n          \"description\": \"\",\r\n          \"key\": \"AdvancedAnalytics:Scenarios\"\r\n        }\r\n      ]\r\n    },\r\n    {\r\n      \"group_name\": \"Receive Alerts\",\r\n      \"group_description\": \"Receive Alerts for assigned events.\",\r\n      \"access_list\": [\r\n        {\r\n          \"name\": \"Automated\",\r\n          \"description\": \"\",\r\n          \"key\": \"ReceiveAlerts:Automated\"\r\n        },\r\n        {\r\n          \"name\": \"Manual\",\r\n          \"description\": \"\",\r\n          \"key\": \"ReceiveAlerts:Manual\"\r\n        }\r\n      ]\r\n    },\r\n    {\r\n      \"group_name\": \"Send Alerts\",\r\n      \"group_description\": \"Send Manual Alerts to selected user segment when required.\",\r\n      \"access_list\": [\r\n        {\r\n          \"name\": \"Send Manual Alerts\",\r\n          \"description\": \"\",\r\n          \"key\": \"SendAlerts:Manual\"\r\n        }\r\n      ]\r\n    },\r\n    {\r\n      \"group_name\": \"Configure Stations\",\r\n      \"group_description\": \"Configure Stations,e.g. Threshold Limit etc. of various assigned stations.\",\r\n      \"access_list\": [\r\n        {\r\n          \"name\": \"Set Thresholds for Alert Generation\",\r\n          \"description\": \"\",\r\n          \"key\": \"ConfigureStations:SetAlertThresholds\"\r\n        }\r\n      ]\r\n    },\r\n    {\r\n      \"group_name\": \"Configure Alerts\",\r\n      \"group_description\": \"Configure when to generate an alert and to who it should be delivered\",\r\n      \"access_list\": [\r\n        {\r\n          \"name\": \"Automated\",\r\n          \"description\": \"\",\r\n          \"key\": \"ConfigureAlerts:Automated\"\r\n        },\r\n        {\r\n          \"name\": \"Manual\",\r\n          \"description\": \"\",\r\n          \"key\": \"ConfigureAlerts:Manual\"\r\n        }\r\n      ]\r\n    },\r\n    {\r\n      \"group_name\": \"Manage Users\",\r\n      \"group_description\": \"Manage users and their access to various features\",\r\n      \"access_list\": [\r\n        {\r\n          \"name\": \"Get List of Existing Users\",\r\n          \"description\": \"\",\r\n          \"key\": \"ManageUsers:GetUser\"\r\n        },\r\n        {\r\n          \"name\": \"Create New User\",\r\n          \"description\": \"\",\r\n          \"key\": \"ManageUsers:CreateUser\"\r\n        },\r\n        {\r\n          \"name\": \"Modify Existing User\",\r\n          \"description\": \"\",\r\n          \"key\": \"ManageUsers:EditUser\"\r\n        },\r\n        {\r\n          \"name\": \"Delete Existing User\",\r\n          \"description\": \"\",\r\n          \"key\": \"ManageUsers:DeleteUser\"\r\n        },\r\n        {\r\n          \"name\": \"Get List of User Groups\",\r\n          \"description\": \"\",\r\n          \"key\": \"ManageUsers:GetUserGroup\"\r\n        },\r\n        {\r\n          \"name\": \"Create New User Group\",\r\n          \"description\": \"\",\r\n          \"key\": \"ManageUsers:CreateUserGroup\"\r\n        },\r\n        {\r\n          \"name\": \"Modify Existing User Group\",\r\n          \"description\": \"\",\r\n          \"key\": \"ManageUsers:EditUserGroup\"\r\n        },\r\n        {\r\n          \"name\": \"Delete Existing User Group\",\r\n          \"description\": \"\",\r\n          \"key\": \"ManageUsers:DeleteUserGroup\"\r\n        },\r\n        {\r\n          \"name\": \"Get List of Existing User Roles\",\r\n          \"description\": \"\",\r\n          \"key\": \"ManageUsers:GetUserRole\"\r\n        },\r\n        {\r\n          \"name\": \"Create New User Role\",\r\n          \"description\": \"\",\r\n          \"key\": \"ManageUsers:CreateUserRole\"\r\n        },\r\n        {\r\n          \"name\": \"Modify Existing User Role\",\r\n          \"description\": \"\",\r\n          \"key\": \"ManageUsers:EditUserRole\"\r\n        },\r\n        {\r\n          \"name\": \"Delete Existing User Role\",\r\n          \"description\": \"\",\r\n          \"key\": \"ManageUsers:DeleteUserRole\"\r\n        }\r\n      ]\r\n    }\r\n  ]\r\n}');

CREATE TABLE `user_groups` (
  `ug_id` bigint(20) UNSIGNED NOT NULL,
  `serv_id` bigint(20) UNSIGNED NOT NULL,
  `clep_id` bigint(20) UNSIGNED NOT NULL,
  `ug_name` varchar(255) NOT NULL,
  `ug_description` varchar(255) NOT NULL,
  `ur_id` bigint(20) UNSIGNED NOT NULL,
  `ug_created_by` bigint(20) UNSIGNED NOT NULL,
  `ug_created_at` bigint(10) UNSIGNED NOT NULL,
  `ug_created_from` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `user_groups` VALUES(1, 19, 365, 'North Managers', 'Managers for north wing stations', 2, 1, 1537249944, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36');
INSERT INTO `user_groups` VALUES(3, 19, 365, 'North Managers', 'Managers for north wing stations', 2, 1, 1537266596, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36');

CREATE TABLE `user_groups_station_link` (
  `ug_id` bigint(20) UNSIGNED NOT NULL,
  `ugsl_link_id` bigint(20) UNSIGNED NOT NULL,
  `ugsl_what_link` tinyint(2) UNSIGNED NOT NULL COMMENT '1 -> station id, 2-> station group id'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `user_groups_station_link` VALUES(3, 1, 1);
INSERT INTO `user_groups_station_link` VALUES(3, 2, 1);
INSERT INTO `user_groups_station_link` VALUES(1, 1, 2);

CREATE TABLE `user_groups_user_link` (
  `ug_id` bigint(20) UNSIGNED NOT NULL,
  `usr_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `user_groups_user_link` VALUES(3, 1);
INSERT INTO `user_groups_user_link` VALUES(3, 2);
INSERT INTO `user_groups_user_link` VALUES(3, 3);
INSERT INTO `user_groups_user_link` VALUES(1, 3);
INSERT INTO `user_groups_user_link` VALUES(1, 5);

CREATE TABLE `user_notification_tokens` (
  `usr_id` bigint(20) UNSIGNED NOT NULL,
  `unt_token` varchar(255) NOT NULL,
  `unt_type` tinyint(1) UNSIGNED NOT NULL COMMENT '1 -> FCM id',
  `unt_source_os` tinyint(1) UNSIGNED NOT NULL COMMENT '1 -> Android',
  `unt_is_active` tinyint(1) UNSIGNED NOT NULL COMMENT '1 -> Active, 0 -> In active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `user_roles` (
  `ur_id` bigint(20) UNSIGNED NOT NULL,
  `clep_id` bigint(20) UNSIGNED NOT NULL,
  `serv_id` bigint(20) UNSIGNED NOT NULL,
  `ur_name` varchar(255) NOT NULL,
  `ur_description` varchar(255) NOT NULL,
  `ur_access` text NOT NULL,
  `ur_created_at` bigint(10) UNSIGNED NOT NULL,
  `ur_created_by` bigint(20) UNSIGNED NOT NULL,
  `ur_created_from` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `user_roles` VALUES(2, 365, 19, 'Manager', 'I am a manager', '*', 1537184584, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36');
INSERT INTO `user_roles` VALUES(3, 365, 19, 'Worker', 'I am a worker', '*', 1537184606, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36');


ALTER TABLE `flood_monitoring_stations`
  ADD PRIMARY KEY (`fms_id`),
  ADD KEY `fms_sub_cat_id` (`fms_sub_cat_id`);

ALTER TABLE `flood_monitoring_station_categories`
  ADD PRIMARY KEY (`fms_cat_id`);

ALTER TABLE `flood_monitoring_station_parameters`
  ADD PRIMARY KEY (`fms_prm_id`);

ALTER TABLE `flood_monitoring_station_sub_categories`
  ADD PRIMARY KEY (`fms_sub_cat_id`),
  ADD KEY `fms_cat_id` (`fms_cat_id`);

ALTER TABLE `iot_devices`
  ADD PRIMARY KEY (`idev_id`);

ALTER TABLE `iot_device_types`
  ADD PRIMARY KEY (`idt_id`);

  
ALTER TABLE `station_groups` ADD PRIMARY KEY(`stgr_id`);

ALTER TABLE `station_groups` CHANGE `stgr_id` `stgr_id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `flood_monitoring_stations`
  MODIFY `fms_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

ALTER TABLE `flood_monitoring_station_categories`
  MODIFY `fms_cat_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `flood_monitoring_station_parameters`
  MODIFY `fms_prm_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `flood_monitoring_station_sub_categories`
  MODIFY `fms_sub_cat_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

ALTER TABLE `iot_devices`
  MODIFY `idev_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

ALTER TABLE `flood_monitoring_station_sub_categories`
  ADD CONSTRAINT `flood_monitoring_station_sub_categories_ibfk_1` FOREIGN KEY (`fms_cat_id`) REFERENCES `flood_monitoring_station_categories` (`fms_cat_id`) ON DELETE CASCADE ON UPDATE CASCADE;
UPDATE iot_devices SET industry_id = 365 WHERE industry_id = 1;
UPDATE iot_devices SET serv_id = 19 WHERE serv_id IN (1,15);


COMMIT;
