
import React from "react";
import Layout from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, CheckCircle2, XCircle } from "lucide-react";

const AppointmentCard: React.FC<{
  patient: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled";
  reason: string;
}> = ({ patient, date, time, status, reason }) => {
  return (
    <Card className="glass-card hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between">
          <span>{patient}</span>
          <span className={
            status === "scheduled" ? "text-yellow-500" : 
            status === "completed" ? "text-green-500" : 
            "text-red-500"
          }>
            {status === "scheduled" ? 
              <Clock size={18} /> : 
              status === "completed" ? 
                <CheckCircle2 size={18} /> : 
                <XCircle size={18} />
            }
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted-foreground" />
            <span>{date} at {time}</span>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mt-1">Reason: {reason}</p>
          </div>
          <div className="pt-3 flex gap-2">
            <button className="px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary text-xs rounded-md transition-colors">
              Reschedule
            </button>
            {status === "scheduled" && (
              <button className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-500 text-xs rounded-md transition-colors">
                Complete
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminPanel: React.FC = () => {
  const appointments = [
    { id: 1, patient: "John Smith", date: "2025-04-08", time: "09:00 AM", status: "scheduled" as const, reason: "Annual checkup" },
    { id: 2, patient: "Sara Johnson", date: "2025-04-08", time: "10:30 AM", status: "scheduled" as const, reason: "Follow-up appointment" },
    { id: 3, patient: "Mike Brown", date: "2025-04-07", time: "03:15 PM", status: "completed" as const, reason: "Prescription renewal" },
    { id: 4, patient: "Emma Wilson", date: "2025-04-07", time: "11:45 AM", status: "cancelled" as const, reason: "Consultation" },
    { id: 5, patient: "David Lee", date: "2025-04-09", time: "02:00 PM", status: "scheduled" as const, reason: "Test results review" },
  ];

  return (
    <Layout>
      <div className="healthcare-container">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient">Doctor Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Manage your appointments and patient schedules</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Upcoming Appointments</h2>
              <span className="flex items-center gap-1 text-primary text-sm">
                <Users size={16} />
                <span>5 patients</span>
              </span>
            </div>
            
            <div className="space-y-4 staggered-animation">
              {appointments.map(appointment => (
                <AppointmentCard 
                  key={appointment.id}
                  patient={appointment.patient}
                  date={appointment.date}
                  time={appointment.time}
                  status={appointment.status}
                  reason={appointment.reason}
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl text-gradient">Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border-b border-border">
                    <div>
                      <p className="font-medium text-white">Sara Johnson</p>
                      <p className="text-xs text-muted-foreground">Follow-up appointment</p>
                    </div>
                    <span className="text-sm text-muted-foreground">10:30 AM</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border-b border-border">
                    <div>
                      <p className="font-medium text-white">John Smith</p>
                      <p className="text-xs text-muted-foreground">Annual checkup</p>
                    </div>
                    <span className="text-sm text-muted-foreground">09:00 AM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl text-gradient">Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="text-muted-foreground text-sm">Total Patients</p>
                    <p className="text-2xl font-bold text-white">247</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="text-muted-foreground text-sm">This Week</p>
                    <p className="text-2xl font-bold text-white">28</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="text-muted-foreground text-sm">Completed</p>
                    <p className="text-2xl font-bold text-green-500">18</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="text-muted-foreground text-sm">Pending</p>
                    <p className="text-2xl font-bold text-yellow-500">10</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPanel;
