
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Bell, Check, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  date: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New order received",
    message: "Order #1234 has been placed.",
    type: "info",
    date: "1 hour ago",
    read: false,
  },
  {
    id: "2",
    title: "Payment successful",
    message: "Payment for order #1233 has been processed.",
    type: "success",
    date: "2 hours ago",
    read: false,
  },
  {
    id: "3",
    title: "Low inventory alert",
    message: "Product 'Wireless Headphones' is running low on stock.",
    type: "warning",
    date: "5 hours ago",
    read: true,
  },
  {
    id: "4",
    title: "New feature available",
    message: "Check out our new analytics dashboard!",
    type: "info",
    date: "1 day ago",
    read: true,
  },
];

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "info":
      return <Info className="h-4 w-4 text-blue-500" />;
    case "success":
      return <Check className="h-4 w-4 text-green-500" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Add activity logs query
  const { data: activityLogs = [] } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  // Convert activity logs to notifications format with proper type casting
  const activityNotifications: Notification[] = activityLogs.map(log => {
    // Map action_type to an appropriate notification type
    let notificationType: "info" | "success" | "warning" = "info";
    
    if (log.action_type === 'delete') {
      notificationType = "warning";
    } else if (log.action_type === 'insert') {
      notificationType = "success";
    }
    
    return {
      id: log.id,
      title: `${log.action_type.toUpperCase()} ${log.table_name}`,
      message: `Record ${log.record_id} was ${log.action_type}ed`,
      type: notificationType,
      date: new Date(log.created_at).toLocaleString(),
      read: false,
    };
  });

  // Combine existing notifications with activity logs
  const allNotifications = [...notifications, ...activityNotifications];

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="space-y-4 mt-4">
            {allNotifications.length > 0 ? (
              allNotifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification}
                />
              ))
            ) : (
              <EmptyState message="No notifications yet" />
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="unread">
          <div className="space-y-4 mt-4">
            {allNotifications.filter(n => !n.read).length > 0 ? (
              allNotifications
                .filter(n => !n.read)
                .map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification}
                  />
                ))
            ) : (
              <EmptyState message="No unread notifications" />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const NotificationItem = ({ notification }: { notification: Notification }) => {
  return (
    <Card className={`shadow-sm ${!notification.read ? 'bg-accent/10' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="bg-muted rounded-full p-2">
            <NotificationIcon type={notification.type} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{notification.title}</h3>
              <span className="text-xs text-muted-foreground">{notification.date}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ message }: { message: string }) => {
  return (
    <Card>
      <CardContent className="p-8 flex flex-col items-center justify-center">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <CardTitle className="text-xl mb-2">{message}</CardTitle>
        <CardDescription>
          You're all caught up!
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default Notifications;
