export type DeviceSession = {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
};

export type DeviceSessionDb = {
  userId: string;
  deviceId: string;
  issuedAt: Date;
  expiresAt: Date;
  deviceName: string;
  ip: string;
};
