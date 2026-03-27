package com.smartwallet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.smartwallet.repository", excludeFilters = {
        @org.springframework.context.annotation.ComponentScan.Filter(
                type = org.springframework.context.annotation.FilterType.ASSIGNABLE_TYPE,
                classes = {com.smartwallet.repository.VkycRepository.class}
        )
})
@EnableMongoRepositories(basePackages = "com.smartwallet.repository", includeFilters = {
        @org.springframework.context.annotation.ComponentScan.Filter(
                type = org.springframework.context.annotation.FilterType.ASSIGNABLE_TYPE,
                classes = {com.smartwallet.repository.VkycRepository.class}
        )
})
public class SmartWalletApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartWalletApplication.class, args);
    }
}

