import { Button } from "../components/ui/button";
import { ArrowLeft, Brain, TrendingUp, BookOpen } from "lucide-react";
import { Link } from "wouter";
import Navigation from "../components/navigation";
import Logo from "../components/logo";

export default function About() {
  return (
    <div className="min-h-screen bg-green-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-center mb-6">
            <Logo size="lg" className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-800 text-center mb-6">About Us</h1>
          
          {/* Content */}
          <div className="space-y-8 text-lg text-gray-700 leading-relaxed">
            {/* Mission Statement */}
            <div className="text-center">
              <p className="text-xl text-green-700 font-medium italic mb-6">
                Leveraging machine learning and econometric models to track and understand chemical exposure in the modern world
              </p>
            </div>

            {/* Our Approach Section */}
            <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
              <div className="flex items-start space-x-3 mb-4">
                <Brain className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold text-green-800 mb-3">Our Approach</h2>
                  <p className="text-gray-700 mb-4">
                    At ChemTracer, we're pioneering the use of advanced machine learning algorithms and econometric regression models to create the most accurate chemical exposure tracking system available. Our team of data scientists and environmental health researchers work tirelessly to keep pace with the ever-evolving field of microplastic and PFAS research.
                  </p>
                  <p className="text-gray-700">
                    By applying sophisticated statistical methods including time-series analysis, multivariate regression, and predictive modeling, we transform complex scientific data into actionable insights for everyday users. Our models are continuously refined as new peer-reviewed research emerges, ensuring our risk assessments remain at the cutting edge of environmental health science.
                  </p>
                </div>
              </div>
            </div>

            {/* Technology Section */}
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-start space-x-3 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold text-blue-800 mb-3">Advanced Analytics</h2>
                  <p className="text-gray-700 mb-4">
                    Our econometric models go beyond simple tracking. We employ:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>Regression Analysis:</strong> Identifying causal relationships between exposure sources and health outcomes</li>
                    <li><strong>Time-Series Forecasting:</strong> Predicting future exposure trends based on your habits</li>
                    <li><strong>Machine Learning Classification:</strong> Categorizing risk levels using ensemble methods</li>
                    <li><strong>Bayesian Inference:</strong> Updating risk assessments as new data becomes available</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Research Commitment */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Commitment to Research
              </h2>
              <p className="text-gray-700 mb-4">
                The fields of microplastic and PFAS research are rapidly evolving, with new studies published weekly. Our team maintains partnerships with leading research institutions to ensure our models incorporate the latest findings. We believe that by combining cutting-edge data science with rigorous environmental health research, we can empower individuals to make informed decisions about their chemical exposure.
              </p>
              <p className="text-gray-700">
                Our goal is not just to track exposure, but to build a comprehensive understanding of how these chemicals affect human health over time. Through continuous refinement of our econometric models and integration of new research, we're working towards a future where everyone can minimize their exposure to harmful chemicals.
              </p>
            </div>

            {/* Further Reading Link */}
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <BookOpen className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Learn More About Our Trackers</h3>
              <p className="text-gray-700 mb-4">
                Discover the science behind our Microplastic and PFAS trackers
              </p>
              <Link href="/further-reading">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Further Reading
                </Button>
              </Link>
            </div>

            {/* Contact Section */}
            <div className="text-center pt-4">
              <p className="text-gray-700">
                <strong>Contact Us:</strong> Email the team with suggestions at{" "}
                <a 
                  href="mailto:jake@thechemtracer.com" 
                  className="text-green-600 hover:text-green-800 underline"
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