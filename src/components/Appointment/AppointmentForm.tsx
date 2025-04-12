
import React, { useState } from "react";
import { Calendar, Clock, MapPin, X } from "lucide-react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { RadioGroup, RadioGroupItem } from "@/components/UI/radio-group";
import { useToast } from "@/hooks/use-toast";

interface AppointmentFormProps {
  doctorId: string;
  doctorName: string;
  specialty: string;
  onClose: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  doctorId,
  doctorName,
  specialty,
  onClose
}) => {
  const { toast } = useToast();
  
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<string>("in-person");
  
  const [loading, setLoading] = useState<boolean>(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!date || !time || !reason) {
      toast({
        title: "Missing information",
        description: "Please fill all the required fields",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Appointment Booked",
        description: `Your appointment with Dr. ${doctorName} on ${date} at ${time} has been confirmed.`,
      });
      setLoading(false);
      onClose();
    }, 1500);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-black rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Book Appointment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4 pb-4 border-b border-gray-100">
            <h3 className="font-medium ">{doctorName}</h3>
            <p className="text-healthcare-600 text-sm">{specialty}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-black">
                    <Calendar size={16} />
                  </div>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-10"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="time">Time</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-gray-400">
                    <Clock size={16} />
                  </div>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="appointmentType">Appointment Type</Label>
                <RadioGroup 
                  defaultValue="in-person" 
                  value={appointmentType}
                  onValueChange={setAppointmentType}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="in-person" id="in-person" />
                    <Label htmlFor="in-person" className="cursor-pointer">In-person</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="video" id="video" />
                    <Label htmlFor="video" className="cursor-pointer">Video Call</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {appointmentType === "in-person" && (
                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                      <MapPin size={16} />
                    </div>
                    <Input
                      id="location"
                      value="Main Clinic - 123 Healthcare St."
                      className="pl-10"
                      readOnly
                    />
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="reason">Reason for Visit</Label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="healthcare-input min-h-[100px]"
                  placeholder="Please describe your symptoms or reason for visit"
                  required
                ></textarea>
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="healthcare-button-primary w-full"
                  disabled={loading}
                >
                  {loading ? "Booking..." : "Confirm Appointment"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
