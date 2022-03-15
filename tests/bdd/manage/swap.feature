Feature: Swap funds

    Background:
        Given the MetaMask wallet is connected
        When the user navigates to Tempus
            And the user clicks on "Manage"

    Scenario: Swap ETH
        When the user clicks "Swap"

