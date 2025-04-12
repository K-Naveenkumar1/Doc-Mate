
import React, { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import { Search, Calendar, Clock, MapPin, User, Phone, WifiOff, Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppointmentForm from "@/components/Appointment/AppointmentForm";

// Mock doctor data
const doctors = [
  {
    id: "dr-1",
    name: "Dr. Sarah Johnson",
    specialty: "General Medicine",
    rating: 4.8,
    availability: ["Today, 2:00 PM", "Tomorrow, 10:30 AM"],
    address: "123 Medical Center, New York",
    distance: "2.5 miles",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&h=300&q=80",
    isOnline: true
  },
  {
    id: "dr-2",
    name: "Dr. Michael Chen",
    specialty: "Cardiology",
    rating: 4.9,
    availability: ["Tomorrow, 1:15 PM", "Wed, 11:00 AM"],
    address: "456 Heart Center, New York",
    distance: "3.2 miles",
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&h=300&q=80",
    isOnline: false
  },
  {
    id: "dr-3",
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    rating: 4.7,
    availability: ["Thu, 9:30 AM", "Fri, 3:45 PM"],
    address: "789 Children's Hospital, New York",
    distance: "1.8 miles",
    imageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=300&h=300&q=80",
    isOnline: true
  },
  {
    id: "dr-4",
    name: "Dr. James Wilson",
    specialty: "Dermatology",
    rating: 4.6,
    availability: ["Mon, 11:00 AM", "Wed, 2:30 PM"],
    address: "321 Skin Care Center, New York",
    distance: "4.1 miles",
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&h=300&q=80",
    isOnline: false
  }
];

// Mock upcoming appointments
const upcomingAppointments = [
  {
    id: "apt-1",
    doctorName: "Dr. Michael Chen",
    specialty: "Cardiology",
    date: "Tomorrow",
    time: "1:15 PM",
    location: "456 Heart Center, New York",
    type: "In-person"
  },
  {
    id: "apt-2",
    doctorName: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    date: "April 15, 2025",
    time: "9:30 AM",
    location: "789 Children's Hospital, New York",
    type: "Telehealth"
  }
];

const Appointments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("find");
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleBookAppointment = (doctorId: string, timeSlot: string) => {
    toast({
      title: "Appointment Booked",
      description: `Your appointment has been scheduled for ${timeSlot}`,
    });
  };
  
  const handleCancelAppointment = (appointmentId: string) => {
    toast({
      title: "Appointment Cancelled",
      description: "Your appointment has been cancelled successfully.",
    });
  };
  
  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAppointmentForm = (doctorId: string) => {
    setSelectedDoctor(doctorId);
  };

  const handleCloseAppointmentForm = () => {
    setSelectedDoctor(null);
  };

  const selectedDoctorData = doctors.find(doctor => doctor.id === selectedDoctor);
  
  return (
    <Container>
      <div className="p-6">
        <Tabs defaultValue="find" onValueChange={setSelectedTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-3xl font-bold text-gradient mb-4 sm:mb-0">Appointments</h1>
            <TabsList className="self-start sm:self-auto">
              <TabsTrigger value="find">Find Doctor</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="find" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search by doctor name or specialty"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <MapPin className="mr-2 h-4 w-4" />
                Near Me
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map(doctor => (
                  <Card key={doctor.id} className="overflow-hidden bg-sidebar-accent/30 border-border">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-1/3 h-40 sm:h-auto relative">
                          <img 
                            src={doctor.imageUrl} 
                            alt={doctor.name} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 flex items-center bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                            {doctor.isOnline ? (
                              <>
                                <Wifi className="h-3 w-3 mr-1 text-green-400" />
                                <span>Online</span>
                              </>
                            ) : (
                              <>
                                <WifiOff className="h-3 w-3 mr-1 text-red-400" />
                                <span>Offline</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col justify-between w-full sm:w-2/3">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">{doctor.name}</h3>
                            <p className="text-muted-foreground text-sm mb-2">{doctor.specialty}</p>
                            <div className="flex items-center mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-4 h-4 ${i < Math.floor(doctor.rating) ? "text-yellow-400" : "text-muted-foreground"}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm ml-1">{doctor.rating}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mb-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{doctor.distance} away</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{doctor.address}</span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Available slots:</p>
                            <div className="flex flex-wrap gap-2">
                              {doctor.availability.map((slot, index) => (
                                <Button 
                                  key={index} 
                                  size="sm" 
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => handleBookAppointment(doctor.id, slot)}
                                >
                                  {slot}
                                </Button>
                              ))}
                            </div>
                            <Button 
                              className="w-full mt-3"
                              onClick={() => handleOpenAppointmentForm(doctor.id)}
                            >
                              Book Appointment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-10 bg-sidebar-accent/30 rounded-lg">
                  <p className="text-muted-foreground">No doctors found matching your search.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="upcoming">
            <div className="space-y-4">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map(appointment => (
                  <Card key={appointment.id} className="bg-sidebar-accent/30 border-border">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex-grow">
                          <h3 className="text-lg font-semibold">{appointment.doctorName}</h3>
                          <p className="text-muted-foreground text-sm">{appointment.specialty}</p>
                          <div className="flex items-center mt-2 space-x-4">
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-1 text-primary" />
                              <span>{appointment.date}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-1 text-primary" />
                              <span>{appointment.time}</span>
                            </div>
                          </div>
                          <div className="flex items-center mt-2 text-sm">
                            <MapPin className="h-4 w-4 mr-1 text-primary" />
                            <span>{appointment.location}</span>
                          </div>
                          <div className="mt-2 inline-block px-2 py-1 text-xs rounded-full bg-primary/20 text-primary-foreground">
                            {appointment.type}
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button size="sm" variant="outline" className="flex-1 sm:flex-initial">
                            Reschedule
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="flex-1 sm:flex-initial"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10 bg-sidebar-accent/30 rounded-lg">
                  <p className="text-muted-foreground">You have no upcoming appointments.</p>
                  <Button className="mt-4" onClick={() => setSelectedTab("find")}>Find a Doctor</Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="text-center py-10 bg-sidebar-accent/30 rounded-lg">
              <p className="text-muted-foreground">No past appointments found.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedDoctor && selectedDoctorData && (
        <AppointmentForm 
          doctorId={selectedDoctorData.id} 
          doctorName={selectedDoctorData.name} 
          specialty={selectedDoctorData.specialty} 
          onClose={handleCloseAppointmentForm} 
        />
      )}
    </Container>
  );
};

export default Appointments;
