import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6 text-primary hover:text-primary/80">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">About Us</h1>
          
          {/* Content */}
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              The science behind MicroPlastic Tracker™?
            </h2>
            
            <p>
              MicroPlastic tracker is an AI powered tool that has been trained on peer reviewed studies that measured certain effects of micro plastic exposure on the human body. The ten weekly inputs available on our calculator are based on the top 10 biggest causes of microplastics.
            </p>
            
            <p>
              Our AI is powered by science, math, and awareness. Together we can be the generation to reduce micro plastic exposure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}