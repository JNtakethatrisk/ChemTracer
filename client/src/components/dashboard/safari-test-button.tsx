import { Button } from "../ui/button";
import { useState } from "react";
import { ResultHighlightModal } from "../result-highlight-modal";

export function SafariTestButton() {
  const [showModal, setShowModal] = useState(false);

  const testModal = () => {
    // Clear localStorage
    localStorage.removeItem('microplastic-result-modal-hidden');
    
    // Test localStorage
    console.log('Safari localStorage test:');
    console.log('Can read localStorage:', typeof localStorage !== 'undefined');
    console.log('Current value:', localStorage.getItem('microplastic-result-modal-hidden'));
    
    // Show modal
    setShowModal(true);
  };

  return (
    <>
      <Button 
        onClick={testModal}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        Test Safari Modal
      </Button>
      
      <ResultHighlightModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        totalValue={2.75}
        riskLevel="Normal"
        unit="particles/mL"
        trackerType="microplastic"
      />
    </>
  );
}
