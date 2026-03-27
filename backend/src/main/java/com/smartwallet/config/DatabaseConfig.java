package com.smartwallet.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.boot.jdbc.DataSourceBuilder;
import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

@Configuration
@Conditional(DatabaseConfig.PostgresCondition.class)
public class DatabaseConfig {

    public static class PostgresCondition implements Condition {
        @Override
        public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
            return findDatabaseUrl() != null || 
                   (System.getenv("PGHOST") != null && System.getenv("PGDATABASE") != null);
        }
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        System.out.println("🔍 DatabaseConfig: Starting Auto-Discovery...");
        
        String url = findDatabaseUrl();
        String user = System.getenv("PGUSER");
        String pass = System.getenv("PGPASSWORD");

        if (url != null) {
            try {
                if (url.startsWith("jdbc:postgresql://")) {
                    System.out.println("✅ Using existing JDBC URL.");
                } else {
                    URI dbUri = new URI(url);
                    if (dbUri.getUserInfo() != null) {
                        String[] userInfo = dbUri.getUserInfo().split(":");
                        user = userInfo[0];
                        pass = userInfo.length > 1 ? userInfo[1] : "";
                    }
                    int port = dbUri.getPort() == -1 ? 5432 : dbUri.getPort();
                    url = String.format("jdbc:postgresql://%s:%d%s", dbUri.getHost(), port, dbUri.getPath());
                    System.out.println("✅ Converted URI to JDBC format.");
                }
            } catch (Exception e) {
                System.out.println("⚠️ Found URL but failed to parse: " + (url.length() > 10 ? url.substring(0, 10) : url) + "...");
                url = null;
            }
        }

        if (url == null) {
            String host = System.getenv("PGHOST");
            String port = System.getenv("PGPORT");
            String db = System.getenv("PGDATABASE");
            if (host != null && db != null) {
                url = String.format("jdbc:postgresql://%s:%s/%s", host, port != null ? port : "5432", db);
                System.out.println("✅ Discovered via PGHOST: " + host + ":" + (port != null ? port : "5432"));
            }
        }

        if (url == null) {
            System.out.println("❌ No remote database found in environment. Falling back to local settings.");
            return null; // This should be handled by the Condition, but safety first
        }

        return DataSourceBuilder.create()
                .url(url)
                .username(user != null ? user : "postgres")
                .password(pass != null ? pass : "postgres")
                .driverClassName("org.postgresql.Driver")
                .build();
    }

    private static String findDatabaseUrl() {
        return System.getenv().values().stream()
                .filter(v -> v != null && !v.contains("${") && (v.startsWith("postgresql://") || v.startsWith("postgres://") || v.startsWith("jdbc:postgresql://")))
                .findFirst()
                .orElse(null);
    }
}
