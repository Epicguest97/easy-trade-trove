import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useTheme } from "@/hooks/useTheme";

const Settings = () => {
  const {
    isLoading,
    saveAccountSettings,
    saveCompanySettings,
    changePassword,
    saveNotificationSettings,
    saveAppearanceSettings
  } = useUserSettings();

  const { theme, setTheme } = useTheme();

  const [accountForm, setAccountForm] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    company: "Acme Inc.",
    role: "Administrator"
  });

  const [companyForm, setCompanyForm] = useState({
    companyName: "Acme Inc.",
    website: "https://acme.com",
    address: "123 Business St.",
    phone: "+1 (555) 123-4567"
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [notifications, setNotifications] = useState({
    emailSales: true,
    emailUpdates: false,
    emailInventory: true,
    smsAlerts: false,
    desktopAlerts: true,
  });

  const [appearance, setAppearance] = useState({
    theme: "light",
    density: "default"
  });

  const handleAccountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setAccountForm(prev => ({ ...prev, [id]: value }));
  };

  const handleCompanyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCompanyForm(prev => ({ ...prev, [id]: value }));
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [id]: value }));
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAccountSettings(accountForm);
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveCompanySettings(companyForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    changePassword(passwordForm.currentPassword, passwordForm.newPassword);
  };

  const handleNotificationsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveNotificationSettings(notifications);
  };

  const handleAppearanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAppearanceSettings(appearance.theme, appearance.density);
  };

  const handleThemeSelect = (newTheme: string) => {
    setAppearance(prev => ({ ...prev, theme: newTheme }));
    setTheme(newTheme as "light" | "dark" | "system");
  };

  const handleDensitySelect = (density: string) => {
    setAppearance(prev => ({ ...prev, density }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <form onSubmit={handleAccountSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your account details and personal information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={accountForm.name}
                      onChange={handleAccountInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      value={accountForm.email}
                      onChange={handleAccountInputChange}
                      type="email" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input 
                      id="company" 
                      value={accountForm.company}
                      onChange={handleAccountInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input 
                      id="role" 
                      value={accountForm.role}
                      onChange={handleAccountInputChange}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </form>
          
          <form onSubmit={handleCompanySubmit} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Update your organization's details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input 
                      id="companyName" 
                      value={companyForm.companyName}
                      onChange={handleCompanyInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      value={companyForm.website}
                      onChange={handleCompanyInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      value={companyForm.address}
                      onChange={handleCompanyInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={companyForm.phone}
                      onChange={handleCompanyInputChange}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
        
        <TabsContent value="notifications">
          <form onSubmit={handleNotificationsSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how you receive notifications and alerts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Sales Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive daily and weekly sales reports
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.emailSales}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, emailSales: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">System Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about system updates and maintenance
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.emailUpdates}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, emailUpdates: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Inventory Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about low inventory items
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.emailInventory}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, emailInventory: checked })
                      }
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Other Notifications</h3>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">SMS Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive critical alerts via text message
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.smsAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, smsAlerts: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Desktop Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show desktop notifications while using the app
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.desktopAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, desktopAlerts: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Preferences"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handlePasswordSubmit} className="space-y-2">
                <h3 className="text-lg font-medium">Change Password</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordInputChange}
                    />
                  </div>
                </div>
                <Button className="mt-4" type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
              
              <Separator className="my-6" />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
                <div className="flex items-center space-x-2 mt-4">
                  <Button variant="outline">Setup 2FA</Button>
                  <Button variant="outline">Manage Devices</Button>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your active sessions
                </p>
                <div className="border rounded-md p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-muted-foreground">
                        Started: {new Date().toLocaleString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Log Out
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <form onSubmit={handleAppearanceSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize how the application looks and feels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Theme</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      className={`border rounded-md p-3 cursor-pointer hover:bg-accent ${theme === 'light' ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => handleThemeSelect('light')}
                    >
                      <div className="space-y-2 text-center">
                        <div className="h-10 w-full bg-background border rounded-md"></div>
                        <p className="text-sm font-medium">Light</p>
                      </div>
                    </div>
                    <div 
                      className={`border rounded-md p-3 cursor-pointer hover:bg-accent ${theme === 'dark' ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => handleThemeSelect('dark')}
                    >
                      <div className="space-y-2 text-center">
                        <div className="h-10 w-full bg-slate-950 border rounded-md"></div>
                        <p className="text-sm font-medium">Dark</p>
                      </div>
                    </div>
                    <div 
                      className={`border rounded-md p-3 cursor-pointer hover:bg-accent ${theme === 'system' ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => handleThemeSelect('system')}
                    >
                      <div className="space-y-2 text-center">
                        <div className="h-10 w-full bg-background border rounded-md relative">
                          <div className="absolute inset-y-0 right-0 w-1/2 bg-slate-950 rounded-r-md"></div>
                        </div>
                        <p className="text-sm font-medium">System</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Density</h3>
                  <p className="text-sm text-muted-foreground">
                    Adjust the density of the user interface
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Button 
                      type="button"
                      variant={appearance.density === 'compact' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleDensitySelect('compact')}
                    >
                      Compact
                    </Button>
                    <Button 
                      type="button"
                      variant={appearance.density === 'default' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleDensitySelect('default')}
                    >
                      Default
                    </Button>
                    <Button 
                      type="button"
                      variant={appearance.density === 'comfortable' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleDensitySelect('comfortable')}
                    >
                      Comfortable
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Preferences"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
