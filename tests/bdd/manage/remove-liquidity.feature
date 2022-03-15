Feature: Remove Liquidity

    Background:
        Given the MetaMask wallet is connected
        When the user navigates to Tempus
            And the user clicks on "Manage"

    Scenario: Remove Liquidity ETH
        When the user clicks "Remove Liquidity"
