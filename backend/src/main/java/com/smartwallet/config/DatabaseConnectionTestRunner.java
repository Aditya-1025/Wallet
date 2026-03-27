package com.smartwallet.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.data.mongodb.core.MongoTemplate;

import javax.sql.DataSource;

@Component
public class DatabaseConnectionTestRunner implements CommandLineRunner {

    private final DataSource dataSource;
    private final MongoTemplate mongoTemplate;

    public DatabaseConnectionTestRunner(DataSource dataSource, MongoTemplate mongoTemplate) {
        this.dataSource = dataSource;
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        // Test PostgreSQL
        try {
            JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
            String version = jdbcTemplate.queryForObject("SELECT version()", String.class);
            System.out.println("✅ PostgreSQL connected: " + version);
        } catch (Exception e) {
            System.err.println("❌ PostgreSQL connection failed: " + e.getMessage());
        }

        // Test MongoDB
        try {
            String dbName = mongoTemplate.getDb().getName();
            System.out.println("✅ MongoDB connected: database=" + dbName);
        } catch (Exception e) {
            System.err.println("❌ MongoDB connection failed: " + e.getMessage());
        }
    }
}

