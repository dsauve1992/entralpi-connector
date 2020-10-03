const entralpi = new EntralpiConnector()

async function startAcq() {
    const connected = await entralpi.connect(() => console.log('Disconnected'))

    if (connected) {
        await entralpi.startNofifications()
    } else {
        console.log('oups !')
    }
}

async function stopAcq() {
    await entralpi.stopNofifications()
}
