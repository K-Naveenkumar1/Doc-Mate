
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, FileText, Activity, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard: React.FC = () => {
  return (
    <div className="healthcare-container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Doc-Mate</h1>
        <p className="text-gray-600">Your AI-powered healthcare assistant</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-healthcare-100 hover:border-healthcare-300 transition-colors">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-healthcare-100 flex items-center justify-center mb-2">
              <Calendar className="h-6 w-6 text-healthcare-600" />
            </div>
            <CardTitle>Doctor Appointments</CardTitle>
            <CardDescription>Find and book appointments with specialists</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Easily schedule appointments with qualified healthcare professionals in your area.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/appointments" className="healthcare-button-primary w-full text-center">
              Book Appointment
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="border-healthcare-100 hover:border-healthcare-300 transition-colors">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Prescription Analysis</CardTitle>
            <CardDescription>Upload and analyze your prescriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Our AI analyzes your prescriptions and provides easy-to-understand summaries and recommendations.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/prescriptions" className="healthcare-button-secondary w-full text-center">
              Analyze Prescription
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="border-healthcare-100 hover:border-healthcare-300 transition-colors">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle>Health Insights</CardTitle>
            <CardDescription>Personalized health recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Get personalized to-do lists and workout plans based on your health data and prescriptions.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/profile" className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-md transition-colors w-full text-center">
              View Insights
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How AICare Helps You</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-healthcare-100 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-healthcare-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy Appointment Booking</h3>
            <p className="text-gray-600">
              Find and book appointments with qualified healthcare professionals in your area.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Prescription Analysis</h3>
            <p className="text-gray-600">
              Our AI analyzes your prescriptions and provides clear summaries and actionable recommendations.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Personalized Health Plans</h3>
            <p className="text-gray-600">
              Get customized to-do lists and workout recommendations based on your health profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
