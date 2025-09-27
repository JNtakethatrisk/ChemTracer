import { Button } from "../components/ui/button";
import { Brain, TrendingUp, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { Layout } from "../components/layout";
import Logo from "../components/logo";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function About() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 mb-4 sm:mb-8">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Logo size="lg" className="text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 text-center mb-4 sm:mb-6">About Us</h1>
          
          {/* Mobile-First Content */}
          <div className="space-y-4 sm:space-y-8 text-base sm:text-lg text-gray-700 leading-relaxed">
            {/* Mission Statement */}
            <div className="text-center">
              <p className="text-lg sm:text-xl text-green-700 font-medium italic">
                Free tools to track your chemical exposure and protect your health
              </p>
            </div>

            {/* Mobile-Optimized: Key Points */}
            <div className="sm:hidden space-y-3">
              {/* Free Access */}
              <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
                <h3 className="font-semibold text-emerald-800 mb-2">100% Free</h3>
                <p className="text-sm text-gray-700">
                  No hidden fees. No premium plans. Everyone deserves to know what's in their body.
                </p>
              </div>

              {/* Science-Based */}
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-semibold text-blue-800 mb-2">Based on Peer-Reviewed Research</h3>
                <p className="text-sm text-gray-700">
                  Our calculations use the latest scientific studies to give you accurate results.
                </p>
              </div>

              {/* Easy to Use */}
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <h3 className="font-semibold text-green-800 mb-2">Simple & Actionable</h3>
                <p className="text-sm text-gray-700">
                  Track your exposure in minutes. Get personalized insights to reduce your risk.
                </p>
              </div>
            </div>

            {/* Desktop/Tablet: Expandable Sections */}
            <div className="hidden sm:block space-y-4">
              {/* Our Approach Section */}
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <button
                  onClick={() => toggleSection('approach')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-start space-x-3">
                    <Brain className="w-6 h-6 text-green-600 mt-1" />
                    <h2 className="text-2xl font-semibold text-green-800">Our Approach</h2>
                  </div>
                  {expandedSections.approach ? <ChevronUp className="w-5 h-5 text-green-600" /> : <ChevronDown className="w-5 h-5 text-green-600" />}
                </button>
                {expandedSections.approach && (
                  <div className="mt-4 pl-9">
                    <p className="text-gray-700 mb-4">
                      At ChemTracer, we're pioneering the use of advanced machine learning algorithms and econometric regression models to create the most accurate chemical exposure tracking system available. Our team of data scientists and environmental health researchers work tirelessly to keep pace with the ever-evolving field of microplastic and PFAS research.
                    </p>
                    <p className="text-gray-700">
                      Our models are based on peer-reviewed research and are continuously refined as new studies emerge, ensuring our risk assessments remain at the cutting edge of environmental health science.
                    </p>
                  </div>
                )}
              </div>

              {/* Technology Section */}
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                <button
                  onClick={() => toggleSection('technology')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-6 h-6 text-blue-600 mt-1" />
                    <h2 className="text-2xl font-semibold text-blue-800">Advanced Analytics</h2>
                  </div>
                  {expandedSections.technology ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-blue-600" />}
                </button>
                {expandedSections.technology && (
                  <div className="mt-4 pl-9">
                    <p className="text-gray-700 mb-4">
                      Our econometric models go beyond simple tracking. We employ:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li><strong>Regression Analysis:</strong> Identifying relationships between exposure sources and health outcomes</li>
                      <li><strong>Time-Series Forecasting:</strong> Predicting future exposure trends based on your habits</li>
                      <li><strong>Machine Learning Classification:</strong> Categorizing risk levels using ensemble methods</li>
                      <li><strong>Bayesian Inference:</strong> Updating risk assessments as new data becomes available</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Free Access Section */}
              <div className="bg-emerald-50 p-6 rounded-lg border-l-4 border-emerald-500">
                <button
                  onClick={() => toggleSection('free')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h2 className="text-2xl font-semibold text-emerald-800">Free for Everyone</h2>
                  {expandedSections.free ? <ChevronUp className="w-5 h-5 text-emerald-600" /> : <ChevronDown className="w-5 h-5 text-emerald-600" />}
                </button>
                {expandedSections.free && (
                  <div className="mt-4">
                    <p className="text-gray-700 mb-4">
                      ChemTracer is <strong>completely free</strong>. We believe that access to information about chemical exposure is a fundamental right, not a privilege. Every person deserves to understand what they're putting into their body and how it might affect their health.
                    </p>
                    <p className="text-gray-700 mb-4">
                      Our mission is purely educational—to inform and empower the public with scientifically accurate data about microplastic and PFAS exposure. We're not here to sell products or premium subscriptions. We're here to democratize access to environmental health information that has traditionally been locked away in academic journals and research institutions.
                    </p>
                    <p className="text-gray-700">
                      By keeping our platform free and accessible, we hope to raise awareness about these invisible threats and inspire a generation to make more informed choices about their daily consumption habits. Knowledge is power, and we believe everyone deserves that power.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Further Reading Link */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg text-center">
              <BookOpen className="w-6 sm:w-8 h-6 sm:h-8 text-gray-600 mx-auto mb-2 sm:mb-3" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Learn More</h3>
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                Discover the science behind our trackers
              </p>
              <Link href="/further-reading">
                <Button className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base">
                  Further Reading
                </Button>
              </Link>
            </div>

            {/* Contact Section */}
            <div className="text-center pt-4">
              <p className="text-sm sm:text-base text-gray-700">
                <strong>Questions?</strong> Email us at{" "}
                <a 
                  href="mailto:info@thechemtracer.com" 
                  className="text-green-600 hover:text-green-800 underline"
                >
                  info@thechemtracer.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}