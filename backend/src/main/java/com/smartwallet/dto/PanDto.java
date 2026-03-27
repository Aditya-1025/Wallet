package com.smartwallet.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PastOrPresent;
import java.time.LocalDate;

public class PanDto {

    @NotBlank(message = "PAN name cannot be blank")
    @Pattern(regexp = "^[A-Za-z ]{3,100}$", message = "PAN name must be 3-100 characters with only letters and spaces")
    private String panName;

    @NotBlank(message = "PAN number cannot be blank")
    @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]$", message = "PAN format must be: 5 uppercase letters, 4 digits, 1 uppercase letter (e.g., AAAPA1234A)")
    private String panNumber;

    @NotNull(message = "Date of birth cannot be null")
    @PastOrPresent(message = "Date of birth must be in the past")
    private LocalDate dob;

    public String getPanName() {
        return panName;
    }

    public void setPanName(String panName) {
        this.panName = panName;
    }

    public String getPanNumber() {
        return panNumber;
    }

    public void setPanNumber(String panNumber) {
        this.panNumber = panNumber;
    }

    public LocalDate getDob() {
        return dob;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }
}
