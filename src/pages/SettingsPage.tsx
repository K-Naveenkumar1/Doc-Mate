
import React, { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BellRing, Check, Edit, Key, Lock, LogOut, Moon, Shield, Sun, User, X 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { signOut } from "@/services/authService";
import { useNavigate } from "react-router-dom";

const SettingsPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    isEditing: false
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    isChangingPassword: false
  });

  const [notifications, setNotifications] = useState({
    appointments: true,
    medications: true,
    healthTips: false
  });

  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState("medium");

  // Update profile form when user data changes
  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        displayName: user.displayName || "",
        email: user.email || ""
      }));
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    try {
      // Update user metadata in Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileForm.displayName
        }
      });

      if (error) throw error;

      // Update local user state
      if (user) {
        setUser({
          ...user,
          displayName: profileForm.displayName
        });
      }

      setProfileForm(prev => ({
        ...prev,
        isEditing: false
      }));

      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async () => {
    // Validate passwords
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }

    if (securityForm.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: securityForm.newPassword
      });

      if (error) throw error;

      setSecurityForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        isChangingPassword: false
      });

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Password Change Failed",
        description: "There was a problem changing your password.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast({
      title: "Notification Settings Updated",
      description: `${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    toast({
      title: "Theme Changed",
      description: `Theme set to ${newTheme} mode.`,
    });
  };

  const handleFontSizeChange = (newSize: string) => {
    setFontSize(newSize);
    
    // Apply font size changes
    document.documentElement.style.fontSize = 
      newSize === 'small' ? '14px' : 
      newSize === 'large' ? '18px' : '16px';
    
    toast({
      title: "Font Size Changed",
      description: `Font size set to ${newSize}.`,
    });
  };

  const handleDeleteAccount = async () => {
    // This is a placeholder - in a real app, you'd want to show a confirmation dialog
    toast({
      title: "Delete Account",
      description: "This feature is not implemented yet for safety reasons.",
      variant: "destructive",
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign Out Failed",
        description: "There was a problem signing you out.",
        variant: "destructive",
      });
    }
  };

  return (
    <Container className="py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          
          {/* Account Settings */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your account information and profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {profileForm.isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Full Name</Label>
                        <Input 
                          id="displayName" 
                          value={profileForm.displayName}
                          onChange={(e) => setProfileForm({...profileForm, displayName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          value={profileForm.email}
                          readOnly
                          disabled
                        />
                        <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleProfileUpdate}>
                          <Check className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setProfileForm({...profileForm, isEditing: false, displayName: user?.displayName || ""})}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium">Your Information</h3>
                          <p className="text-muted-foreground">
                            {profileForm.displayName || "Not set"} • {profileForm.email}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setProfileForm({...profileForm, isEditing: true})}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Account Actions</h3>
                  <Button 
                    variant="destructive" 
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {securityForm.isChangingPassword ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                          id="currentPassword" 
                          type="password"
                          value={securityForm.currentPassword}
                          onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                          id="newPassword" 
                          type="password"
                          value={securityForm.newPassword}
                          onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password"
                          value={securityForm.confirmPassword}
                          onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handlePasswordChange}>
                          <Check className="mr-2 h-4 w-4" />
                          Update Password
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setSecurityForm({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                            isChangingPassword: false
                          })}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => setSecurityForm({...securityForm, isChangingPassword: true})}
                    >
                      <Key className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p>Enhance your account security with 2FA</p>
                      <p className="text-sm text-muted-foreground">
                        Currently disabled
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => {
                      toast({
                        title: "Two-Factor Authentication",
                        description: "This feature is coming soon.",
                      });
                    }}>
                      <Lock className="mr-2 h-4 w-4" />
                      Set Up
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Danger Zone</h3>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BellRing className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Control how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="appointments">Appointment Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about upcoming appointments
                      </p>
                    </div>
                    <Switch 
                      id="appointments" 
                      checked={notifications.appointments}
                      onCheckedChange={(value) => handleNotificationChange("appointments", value)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="medications">Medication Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get reminders when it's time to take your medication
                      </p>
                    </div>
                    <Switch 
                      id="medications" 
                      checked={notifications.medications}
                      onCheckedChange={(value) => handleNotificationChange("medications", value)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="healthTips">Health Tips</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive occasional health tips and recommendations
                      </p>
                    </div>
                    <Switch 
                      id="healthTips" 
                      checked={notifications.healthTips}
                      onCheckedChange={(value) => handleNotificationChange("healthTips", value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize how the application looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <RadioGroup 
                    value={theme} 
                    onValueChange={handleThemeChange}
                    className="grid grid-cols-2 gap-4"
                  >
                    <Label
                      htmlFor="dark"
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground ${
                        theme === 'dark' ? 'border-primary' : ''
                      }`}
                    >
                      <RadioGroupItem value="dark" id="dark" className="sr-only" />
                      <Moon className="mb-3 h-6 w-6" />
                      <div className="text-center">Dark</div>
                    </Label>
                    <Label
                      htmlFor="light"
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground ${
                        theme === 'light' ? 'border-primary' : ''
                      }`}
                    >
                      <RadioGroupItem value="light" id="light" className="sr-only" />
                      <Sun className="mb-3 h-6 w-6" />
                      <div className="text-center">Light</div>
                    </Label>
                  </RadioGroup>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <RadioGroup value={fontSize} onValueChange={handleFontSizeChange}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="small" id="small" />
                      <Label htmlFor="small">Small</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="large" id="large" />
                      <Label htmlFor="large">Large</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
};

export default SettingsPage;
