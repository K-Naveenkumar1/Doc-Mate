
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  Calendar, 
  FileText, 
  Heart, 
  LogOut, 
  MessageSquare, 
  SettingsIcon, 
  Stethoscope, 
  User 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Container } from "@/components/ui/container";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <Container className="py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Section */}
        <div className="w-full md:w-1/3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user?.photoUrl || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">
                  {user?.displayName || "User"}
                </h2>
                <p className="text-muted-foreground mb-2">{user?.email}</p>
                <Badge variant="outline" className="mb-4">Active Member</Badge>
              </div>

              <Separator className="my-4" />
              
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => handleNavigate("/profile")}
                >
                  <User className="mr-2 h-5 w-5" />
                  <span>My Profile</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => handleNavigate("/appointments")}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  <span>My Appointments</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => handleNavigate("/prescriptions")}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  <span>My Prescriptions</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => handleNavigate("/todos")}
                >
                  <Heart className="mr-2 h-5 w-5" />
                  <span>My Health Tasks</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => handleNavigate("/settings")}
                >
                  <SettingsIcon className="mr-2 h-5 w-5" />
                  <span>Settings</span>
                </Button>

                <Separator className="my-4" />
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-2/3">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">My Health Dashboard</h1>
            <p className="text-muted-foreground">Manage your health information and activities</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Appointments
                </CardTitle>
                <CardDescription>Your next scheduled visits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-primary/5">
                    <div className="font-medium">Dr. Sarah Johnson</div>
                    <div className="text-sm text-muted-foreground">General Checkup</div>
                    <div className="text-sm mt-1 flex justify-between">
                      <span>May 15, 2025 • 10:30 AM</span>
                      <Button size="sm" variant="ghost" onClick={() => handleNavigate("/appointments")}>
                        View <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Recent Prescriptions
                </CardTitle>
                <CardDescription>Your latest medications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-primary/5">
                    <div className="font-medium">Amoxicillin</div>
                    <div className="text-sm text-muted-foreground">500mg • 3 times daily</div>
                    <div className="text-sm mt-1 flex justify-between">
                      <span>Prescribed Apr 10, 2025</span>
                      <Button size="sm" variant="ghost" onClick={() => handleNavigate("/prescriptions")}>
                        View <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Health Tasks
                </CardTitle>
                <CardDescription>Your ongoing health activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-primary/5">
                    <div className="font-medium">Daily Medication</div>
                    <div className="text-sm text-muted-foreground">3 tasks pending today</div>
                    <div className="text-sm mt-1 flex justify-between">
                      <span>2 completed, 1 upcoming</span>
                      <Button size="sm" variant="ghost" onClick={() => handleNavigate("/todos")}>
                        View <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  AI Consultations
                </CardTitle>
                <CardDescription>Your AI chat history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-primary/5">
                    <div className="font-medium">Health Analysis</div>
                    <div className="text-sm text-muted-foreground">Last analysis: Apr 8, 2025</div>
                    <div className="text-sm mt-1 flex justify-between">
                      <span>2 recommendations</span>
                      <Button size="sm" variant="ghost" onClick={() => handleNavigate("/ai-analysis")}>
                        View <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Health Overview
              </CardTitle>
              <CardDescription>Your health statistics and summaries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-lg bg-primary/5 text-center">
                  <div className="text-3xl font-bold text-primary">3</div>
                  <div className="text-sm text-muted-foreground">Active Prescriptions</div>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 text-center">
                  <div className="text-3xl font-bold text-primary">2</div>
                  <div className="text-sm text-muted-foreground">Upcoming Appointments</div>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 text-center">
                  <div className="text-3xl font-bold text-primary">85%</div>
                  <div className="text-sm text-muted-foreground">Task Completion</div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleNavigate("/ai-analysis")}
              >
                Get AI Health Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Profile;
