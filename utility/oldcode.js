async function recoveryPhraseEnter(){
    await tabMetamask.fill('input[type="password"] >> nth=0', RECOVERY_PHRASE)
    await tabMetamask.check('div > .first-time-flow__checkbox >> nth=1', METAMASK_PASSWORD)
    await tabMetamask.check('div > .first-time-flow__checkbox >> nth=2', METAMASK_PASSWORD)
    await tabMetamask.click('text=Import')
    await tabMetamask.click('text=All Done')
}