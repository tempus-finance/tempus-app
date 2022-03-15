Feature: Deposit funds

    Background:
        Given the MetaMask wallet is connected
        When the user navigates to Tempus
            And the user clicks on "Manage"

    Scenario: Check if there is enough ETH for gas fees
        When the user types in "entire balance" into "From" field
        Then the "At least 0.05 ETH must be left in your wallet to pay for gas fees." text is displayed

    Scenario: Deposit from ETH
        When the user selects "ETH" from "Please select" dropdown
            And the user types in "10" into "From" field
        Then there is no "Approve" button
            And the typed in value is calculated in US dolars
            And the value of "Balance" is correct
            And the value of "Yield at maturity" under "Fixed Yield" is correct
            And the value of "Total available at maturity" under "Fixed Yield" is correct
            And the value of "Principals" under "Fixed Yield" is correct
            And the value of "Yield at maturity" under "Variable Yield" is correct
            And the value of "Total available at maturity" under "Variable Yield" is correct
            And the value of "Principals" under "Variable Yield" is correct
            And the value of "Staked Principals" under "Variable Yield" is correct
        When the user clicks "Execute"
        Then the "MetaMask" window pops out
            And the "Total" is the sum of typed in value and "Estimated gas fee"
        When the user clickc "Confirm"
        Then the confirmation window is temporarly displayed
            And the "Balance" is reduced by the "Total" amount


    Scenario: Deposit from stETH
        When the user selects "stETH" from "Please select" dropdown
            And the user types in "10" into "From" field
        Then there is an "Approve" button
            And the typed in value is calculated in US dolars
            And the value of "Yield at maturity" under "Fixed Yield" is correct
            And the value of "Total available at maturity" under "Fixed Yield" is correct
            And the value of "Principals" under "Fixed Yield" is correct
            And the value of "Yield at maturity" under "Variable Yield" is correct
            And the value of "Total available at maturity" under "Variable Yield" is correct
            And the value of "Principals" under "Variable Yield" is correct
            And the value of "Staked Principals" under "Variable Yield" is correct

