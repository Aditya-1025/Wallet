package com.smartwallet.dto;

public class BankAccountDto {
    private String accountNumber;
    private String ifscCode;
    private String bankName;

    public BankAccountDto() {}

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getIfscCode() { return ifscCode; }
    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }
}
