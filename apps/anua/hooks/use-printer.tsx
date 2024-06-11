import { useState } from "react";

interface UsePrinterReturn {
  connected: boolean;
  connectPrinter: () => Promise<void>;
  printReceipt: (receipt: string) => Promise<void>;
}

export const usePrinter = (
  vendorId: number,
  productId: number,
): UsePrinterReturn => {
  const [connected, setConnected] = useState(false);
  const [device, setDevice] = useState<USBDevice | null>(null);

  const connectPrinter = async (): Promise<void> => {
    try {
      if ("usb" in navigator) {
        const device = await navigator.usb.requestDevice({
          filters: [{ vendorId, productId }],
        });
        await device.open();

        if (device.configuration === null) {
          await device.selectConfiguration(1);
        }

        await device.claimInterface(0);

        setDevice(device);
        setConnected(true);
      }
    } catch (error) {
      console.error("Erro ao conectar a impressora:", error);
    }
  };

  const printReceipt = async (receipt: string): Promise<void> => {
    if (!device) {
      console.error("Impressora não está conectada");
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(receipt);

    try {
      const endpointNumber = 3; // Endpoint de saída
      await device.transferOut(endpointNumber, data);
    } catch (error) {
      console.error("Erro ao imprimir nota fiscal:", error);
    }
  };

  return { connected, connectPrinter, printReceipt };
};

interface USBDevice {
  readonly configuration: USBConfiguration | null;
  readonly configurations: USBConfiguration[];
  readonly deviceClass: number;
  readonly deviceProtocol: number;
  readonly deviceSubclass: number;
  readonly deviceVersionMajor: number;
  readonly deviceVersionMinor: number;
  readonly deviceVersionSubminor: number;
  readonly manufacturerName: string | null;
  readonly productId: number;
  readonly productName: string | null;
  readonly serialNumber: string | null;
  readonly usbVersionMajor: number;
  readonly usbVersionMinor: number;
  readonly usbVersionSubminor: number;
  readonly vendorId: number;
  open(): Promise<void>;
  close(): Promise<void>;
  selectConfiguration(configurationValue: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  releaseInterface(interfaceNumber: number): Promise<void>;
  controlTransferIn(
    setup: USBControlTransferParameters,
    length: number,
  ): Promise<USBInTransferResult>;
  controlTransferOut(
    setup: USBControlTransferParameters,
    data?: BufferSource,
  ): Promise<USBOutTransferResult>;
  transferIn(
    endpointNumber: number,
    length: number,
  ): Promise<USBInTransferResult>;
  transferOut(
    endpointNumber: number,
    data: BufferSource,
  ): Promise<USBOutTransferResult>;
  clearHalt(direction: USBDirection, endpointNumber: number): Promise<void>;
  forget(): Promise<void>;
}

interface USBConfiguration {
  readonly configurationValue: number;
  readonly configurationName: string | null;
  readonly interfaces: USBInterface[];
}

interface USBInterface {
  readonly interfaceNumber: number;
  readonly alternate: USBAlternateInterface;
  readonly alternates: USBAlternateInterface[];
  readonly claimed: boolean;
}

interface USBAlternateInterface {
  readonly alternateSetting: number;
  readonly interfaceClass: number;
  readonly interfaceSubclass: number;
  readonly interfaceProtocol: number;
  readonly interfaceName: string | null;
  readonly endpoints: USBEndpoint[];
}

interface USBEndpoint {
  readonly endpointNumber: number;
  readonly direction: USBDirection;
  readonly type: USBEndpointType;
  readonly packetSize: number;
}

type USBDirection = "in" | "out";
type USBEndpointType = "bulk" | "interrupt" | "isochronous";

interface USBControlTransferParameters {
  requestType: USBRequestType;
  recipient: USBRecipient;
  request: number;
  value: number;
  index: number;
}

type USBRequestType = "standard" | "class" | "vendor";
type USBRecipient = "device" | "interface" | "endpoint" | "other";

interface USBInTransferResult {
  readonly data: DataView | null;
  readonly status: USBTransferStatus;
}

interface USBOutTransferResult {
  readonly bytesWritten: number;
  readonly status: USBTransferStatus;
}

type USBTransferStatus = "ok" | "stall" | "babble";
