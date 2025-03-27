import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserSettings, CompanySettings } from "@/types/settings";

export const useUserSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Save user account settings
  const saveAccountSettings = async (settings: {
    name: string;
    email: string;
    company: string;
    role: string;
  }) => {
    setIsLoading(true);
    try {
      // In a real application, you would update the user's profile in Supabase
      // This is a simplified version using the admins table
      const { error } = await supabase
        .from('admins')
        .update({
          name: settings.name,
          email: settings.email,
          // Other fields would be updated here
        })
        .eq('admin_id', 'current-user-id'); // In a real app, this would be the actual user ID
      
      if (error) throw error;
      
      toast({
        title: "Settings saved",
        description: "Your account settings have been updated successfully.",
      });
      
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save company settings
  const saveCompanySettings = async (settings: CompanySettings) => {
    setIsLoading(true);
    try {
      // In a real application, this would update a company profile table
      // Since we can't use RPC that doesn't exist, let's use a regular update
      const { error } = await supabase
        .from('admins')  // Assuming we store company info in admins table
        .update({
          company_name: settings.companyName,
          website: settings.website,
          address: settings.address,
          phone: settings.phone,
        })
        .eq('admin_id', 'current-user-id');
      
      if (error) throw error;
      
      toast({
        title: "Company settings saved",
        description: "Your company information has been updated successfully.",
      });
      
    } catch (error) {
      console.error("Error saving company settings:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your company settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {
      // In a real application with auth, you would use Supabase Auth to update the password
      // This is a simplified version
      const { error } = await supabase
        .from('admins')
        .update({ password: newPassword })
        .match({ admin_id: 'current-user-id', password: currentPassword });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: "There was a problem changing your password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle notification settings
  const saveNotificationSettings = async (settings: UserSettings['notifications']) => {
    setIsLoading(true);
    try {
      // In a real application, this would update a user preferences table
      console.log("Notification settings:", settings);
      
      // Simulating an update to user settings
      const { error } = await supabase
        .from('admins')
        .update({
          notification_preferences: settings
        })
        .eq('admin_id', 'current-user-id');
      
      if (error) throw error;
      
      toast({
        title: "Notification preferences saved",
        description: "Your notification preferences have been updated.",
      });
      
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your notification preferences.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save appearance settings
  const saveAppearanceSettings = async (theme: string, density: string) => {
    setIsLoading(true);
    try {
      // In a real application, this would update a user preferences table
      console.log("Appearance settings:", { theme, density });
      
      // Simulating an update to user settings
      const { error } = await supabase
        .from('admins')
        .update({
          theme_preference: theme,
          density_preference: density
        })
        .eq('admin_id', 'current-user-id');
      
      if (error) throw error;
      
      toast({
        title: "Appearance settings saved",
        description: "Your appearance preferences have been updated.",
      });
      
    } catch (error) {
      console.error("Error saving appearance settings:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your appearance preferences.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    saveAccountSettings,
    saveCompanySettings,
    changePassword,
    saveNotificationSettings,
    saveAppearanceSettings,
  };
};
