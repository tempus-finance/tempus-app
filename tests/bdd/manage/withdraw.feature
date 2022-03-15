Feature: Withdraw funds

    Background:
        Given the MetaMask wallet is connected
        When the user navigates to Tempus
            And the user clicks on "Manage"

    Scenario: Witdraw ETH
        When the user clicks "Withdraw"

#Feature: Mint
#Feature: Swap
#Feature: Provide Liquidity
#Feature: Remove Liquidity
