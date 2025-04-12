
import React from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DoctorCardProps {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  availability: string[];
  imageUrl: string;
  onClick: (id: string) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  id,
  name,
  specialty,
  rating,
  availability,
  imageUrl,
  onClick
}) => {
  return (
    <div className="healthcare-card hover:border-healthcare-300 border border-transparent">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/4">
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-32 md:h-40 object-cover rounded-md"
          />
        </div>
        
        <div className="w-full md:w-3/4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
              <p className="text-healthcare-600">{specialty}</p>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-500">★</span>
              <span className="ml-1 text-gray-700">{rating.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600 font-medium">Next Available</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {availability.map((slot, index) => (
                <div key={index} className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded-md flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {slot}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button 
              onClick={() => onClick(id)}
              className="healthcare-button-primary w-full md:w-auto"
            >
              Book Appointment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
