
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, FileText, Activity, Heart, List, Dumbbell, ArrowRight, FolderOpen, BrainCircuit } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const Home: React.FC = () => {
  return (
    <Container>
      <div className="py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-2">Welcome to AICare</h1>
          <p className="text-muted-foreground">Your AI-powered healthcare assistant</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 staggered-animation">
          <Card className="glass-card hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px]">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-gradient">Doctor Appointments</CardTitle>
              <CardDescription className="text-muted-foreground">Find and book appointments with specialists</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80">
                Easily schedule appointments with qualified healthcare professionals in your area.
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/appointments" className="w-full">
                <Button className="w-full flex items-center justify-between">
                  Book Appointment
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="glass-card hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px]">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-blue-900/20 flex items-center justify-center mb-2">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle className="text-gradient">Prescription Analysis</CardTitle>
              <CardDescription className="text-muted-foreground">Upload and analyze your prescriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80">
                Our AI analyzes your prescriptions and provides easy-to-understand summaries and recommendations.
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/prescriptions" className="w-full">
                <Button variant="secondary" className="w-full flex items-center justify-between">
                  Analyze Prescription
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="glass-card hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px]">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-purple-900/20 flex items-center justify-center mb-2">
                <BrainCircuit className="h-6 w-6 text-purple-500" />
              </div>
              <CardTitle className="text-gradient">Mental Health AI</CardTitle>
              <CardDescription className="text-muted-foreground">Analyze patient interactions for mental health markers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80">
                Use AI to analyze speech patterns and detect early signs of depression, anxiety, or PTSD.
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/ai-analysis" className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-between">
                  Start Analysis
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Home;
