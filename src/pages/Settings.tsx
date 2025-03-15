
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const Settings = () => {
  const [notifications, setNotifications] = useState({
    emailSales: true,
    emailUpdates: false,
    emailInventory: true,
    smsAlerts: false,
    desktopAlerts: true,
  });

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
                  <Input id="name" defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue="john.doe@example.com" type="email" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" defaultValue="Acme Inc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" defaultValue="Administrator" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
          
          <Card className="mt-6">
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
                  <Input id="company-name" defaultValue="Acme Inc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-website">Website</Label>
                  <Input id="company-website" defaultValue="https://acme.com" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-address">Address</Label>
                  <Input id="company-address" defaultValue="123 Business St." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input id="company-phone" defaultValue="+1 (555) 123-4567" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
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
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
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
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Change Password</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
                <Button className="mt-4">Update Password</Button>
              </div>
              
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
                  <div className="border rounded-md p-3 cursor-pointer bg-background hover:bg-accent">
                    <div className="space-y-2 text-center">
                      <div className="h-10 w-full bg-background border rounded-md"></div>
                      <p className="text-sm font-medium">Light</p>
                    </div>
                  </div>
                  <div className="border rounded-md p-3 cursor-pointer bg-background hover:bg-accent">
                    <div className="space-y-2 text-center">
                      <div className="h-10 w-full bg-slate-950 border rounded-md"></div>
                      <p className="text-sm font-medium">Dark</p>
                    </div>
                  </div>
                  <div className="border rounded-md p-3 cursor-pointer bg-background hover:bg-accent">
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
                  <Button variant="outline" size="sm">Compact</Button>
                  <Button variant="outline" size="sm">Default</Button>
                  <Button variant="outline" size="sm">Comfortable</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
