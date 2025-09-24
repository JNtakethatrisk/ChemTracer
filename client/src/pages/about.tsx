import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6 text-white hover:text-white/80 hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-white/20 p-8 mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">About Our Trackers</h1>
          
          {/* Content */}
          <div className="space-y-8 text-lg text-slate-700 leading-relaxed">
            {/* Microplastics Section */}
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                Microplastic Tracker™
              </h2>
              
              <p className="mb-4">
                Our Microplastic Tracker is an AI-powered tool trained on peer-reviewed studies that measures microplastic exposure effects on the human body. The weekly inputs are based on the top sources of microplastic exposure.
              </p>
              
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Public Awareness Gaps</h3>
                <p className="text-blue-700 mb-3">
                  Many people are unsure about specific sources of microplastic exposure. For example, only ~half realize that much microplastic comes from fibers in clothing, or that microplastics are intentionally added in certain consumer products.
                </p>
                <p className="text-blue-700 mb-3">
                  The route of exposure (ingestion vs inhalation vs skin) is often not well understood by the public. The dose or threshold that causes harm is generally unknown, and people are worried about that uncertainty.
                </p>
                <p className="text-blue-700">
                  People are less concerned (or less sure) about immediate, short-term health effects, and more about long-term or chronic disease outcomes.
                </p>
              </div>
            </div>

            {/* PFAS Section */}
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                PFA Tracker
              </h2>
              
              <p className="mb-4">
                Our PFA Tracker monitors exposure to PFAS (Per- and Polyfluoroalkyl Substances), also known as "forever chemicals." These persistent chemicals are found in many everyday products and can accumulate in your body over time.
              </p>
              
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-400">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Understanding PFAS</h3>
                <p className="text-green-700 mb-3">
                  PFAS are a group of over 12,000 man-made chemicals that resist heat, water, and oil. They're called "forever chemicals" because they don't break down naturally in the environment and can persist in the human body for years.
                </p>
                <p className="text-green-700 mb-3">
                  These chemicals have been linked to various health concerns including decreased fertility, high blood pressure in pregnant people, increased risk of certain cancers, developmental delays, hormonal disruption, and reduced immune system effectiveness.
                </p>
                <p className="text-green-700">
                  PFAS are found in products like non-stick cookware, water-resistant clothing, food packaging, personal care products, and even in our water supply. Our tracker helps you monitor your exposure from common household sources.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Our Mission</h3>
              <p className="text-slate-700 mb-4">
                Our AI is powered by science, math, and awareness. Together we can be the generation to reduce microplastic and PFAS exposure through better understanding and informed choices.
              </p>
              <p className="text-slate-700">
                <strong>Contact Us:</strong> Email the team with suggestions at{" "}
                <a 
                  href="mailto:jake@thechemtracer.com" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  jake@thechemtracer.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}