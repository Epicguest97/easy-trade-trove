
export interface UserSettings {
  userId: string;
  theme: string;
  density: string;
  notifications: {
    emailSales: boolean;
    emailUpdates: boolean;
    emailInventory: boolean;
    smsAlerts: boolean;
    desktopAlerts: boolean;
  };
}

export interface CompanySettings {
  companyName: string;
  website: string;
  address: string;
  phone: string;
}
