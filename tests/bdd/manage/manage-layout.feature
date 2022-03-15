Feature: Deposit

    Background:
        Given the MetaMask wallet is connected
        When the user navigates to Tempus
            And the user clicks on "Manage"

    Scenario: Check general info in "Pool" section
        Then the value of "Future APR" is correct
            And the value of "Total Value Locked" is correct
            And the value of "Volume (7d)" is correct
            And there is an info button next to "Future APR"
            And there is an info button next to "Fees"

    Scenario: Check general info in "Term" section
        Then the value of "Start Date" is correct
            And the value of "Maturity" is correct
            And the value of "Time Remaining" is correct

    Scenario: Check general info in "Current Position" section
        Then the value of "Principals" is correct
            And the value of "Unstaked" under "Principals" is correct
            And the value of "Staked" under "Principals" is correct
            And the value of "Yields" is correct
            And the value of "Unstaked" under "Yields" is correct
            And the value of "Staked" under "Yields" is correct

    Scenario: Check general info in "Profit & Loss" section
        Then the value of "Current Value" is correct
