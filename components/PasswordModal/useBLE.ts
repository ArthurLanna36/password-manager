/* eslint-disable no-bitwise */
import { PermissionsAndroid, Platform } from "react-native";

import * as ExpoDevice from "expo-device";



//const DATA_SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214";
//const DATA_SERVICE_UUID = "fb349b5f-8000-0080-0010-0000180d0000";
//const DATA_SERVICE_UUID = "0000d081-0000-0100-0800-0008f5b943bf";
//
//const PASSWORD_CHARACTERISTIC_UUID = "2a39";
//
//const bleManager = new BleManager();

function useBLE() {
  //const [allDevices, setAllDevices] = useState<Device[]>([]);
  //const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  //const [color, setColor] = useState("white");

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

//  const connectToDevice = async (device: Device) => {
//    try {
//      const deviceConnection = await bleManager.connectToDevice(device.id);
//      setConnectedDevice(deviceConnection);
//      await deviceConnection.discoverAllServicesAndCharacteristics();
//      bleManager.stopDeviceScan();
//
//    } catch (e) {
//      console.log("FAILED TO CONNECT", e);
//    }
//  };
//
//  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
//    devices.findIndex((device) => nextDevice.id === device.id) > -1;
//
//  const scanForPeripherals = () =>
//    bleManager.startDeviceScan(null, null, (error, device) => {
//      if (error) {
//        console.log(error);
//      }
//
//      if (
//        device &&
//        (device.localName === "PASSWORD_MANAGER" || device.name === "PASSWORD_MANAGER")
//      ) {
//        setAllDevices((prevState: Device[]) => {
//          if (!isDuplicteDevice(prevState, device)) {
//            return [...prevState, device];
//          }
//          return prevState;
//        });
//      }
//    });

  // const onDataUpdate = (
  //   error: BleError | null,
  //   characteristic: Characteristic | null
  // ) => {
  //   if (error) {
  //     console.log(error);
  //     return;
  //   } else if (!characteristic?.value) {
  //     console.log("No Data was received");
  //     return;
  //   }

  //   const colorCode = base64.decode(characteristic.value);

  //   let color = "white";
  //   if (colorCode === "B") {
  //     color = "blue";
  //   } else if (colorCode === "R") {
  //     color = "red";
  //   } else if (colorCode === "G") {
  //     color = "green";
  //   }

  //   setColor(color);
  // };

  //const startStreamingData = async (device: Device) => {
  //  if (device) {
  //    device.monitorCharacteristicForService(
  //      DATA_SERVICE_UUID,
  //      PASSWORD_CHARACTERISTIC_UUID,
  //      onDataUpdate
  //    );
  //  } else {
  //    console.log("No Device Connected");
  //  }
  //};

//  const sendPassword = async (device: Device, password: string) => {
//    const password_encoded = base64.encode(password);
//    try {
//      await bleManager.writeCharacteristicWithResponseForDevice(
//        device?.id ?? "",
//        DATA_SERVICE_UUID,
//        PASSWORD_CHARACTERISTIC_UUID,
//        password_encoded
//      )
//    } catch(e) {
//      console.log(e);
//    }
//  };
//
//  return {
//    connectToDevice,
//    allDevices,
//    connectedDevice,
//    color,
//    requestPermissions,
//    scanForPeripherals,
//    sendPassword,
//  };

  return {
    requestPermissions,
  };
}

export default useBLE;
