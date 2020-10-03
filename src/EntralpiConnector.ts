class EntralpiConnector {
    private readonly PRIMARY_SERVICE_ID = 6173;
    private readonly CHARACTERISTIC_UUID = "0000fff1-0000-1000-8000-00805f9b34fb"
    private readonly OPTIONS = {
        "filters": [
            {
                "namePrefix": "ENTRALPI"
            }
        ],
        "optionalServices": [
            "0000fff4-0000-1000-8000-00805f9b34fb",
            this.CHARACTERISTIC_UUID,
            "0000180a-0000-1000-8000-00805f9b34fb",
            6144,
            6145,
            this.PRIMARY_SERVICE_ID,
            6159,
            "f000ffc0-0451-4000-b000-000000000000",
            "0000fff0-0000-1000-8000-00805f9b34fb",
            6173,
            65521,
            65522,
            1
        ]
    };

    private characteristic: BluetoothRemoteGATTCharacteristic | null = null
    private eventHandler : null | ((e : any) => void) = null

    async connect(onDisconnected: () => void): Promise<Boolean> {
        try {
            const device = await this.selectEntralpiDevice()
            const server = await device!.gatt!.connect();
            console.log('You are now connected to Entralpi')

            device.addEventListener("gattserverdisconnected", onDisconnected);
            const service = await server.getPrimaryService(this.PRIMARY_SERVICE_ID);
            this.characteristic = await service.getCharacteristic(this.CHARACTERISTIC_UUID);

            return true;

        } catch (e) {
            console.log(e)
            return false;
        }
    }

    private onWeightData(handler : (n : number) => void) {
        return function (e :  Event){
            try {
                // @ts-ignore
                const buffer = e.target.value.buffer;
                const rawData = new DataView(buffer);

                handler(rawData.getUint16(0) / 100)
            } catch (error) {
                console.log(error)
            }
        }
    };

    async startNofifications(dataHander : (n : number) => void) : Promise<void>{
        this.eventHandler = this.onWeightData(dataHander)

        if (this.characteristic) {
            console.log('Start listening data...')

            await this.characteristic.startNotifications()
            this.characteristic.addEventListener('characteristicvaluechanged', this.eventHandler);
        }
    }

    async stopNofifications(): Promise<void> {
        if (this.characteristic) {
            console.log('Stop listening data...')

            await this.characteristic.stopNotifications()
            this.characteristic.removeEventListener('characteristicvaluechanged', this.eventHandler);
            this.eventHandler = null;
        }
    }

    private async selectEntralpiDevice(): Promise<BluetoothDevice> {
        try {
            return navigator.bluetooth.requestDevice(this.OPTIONS)
        } catch (error) {
            console.log("Unable to request devices")
            throw error
        }
    }
}

export default EntralpiConnector;



