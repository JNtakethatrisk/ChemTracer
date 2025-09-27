import { Button } from "../ui/button";

export function TestModalButton() {
  const clearModalPreference = () => {
    localStorage.removeItem('microplastic-result-modal-hidden');
    localStorage.removeItem('pfas-result-modal-hidden');
    alert('Modal preferences cleared! The result popups will show again on your next calculation.');
  };

  return (
    <Button 
      onClick={clearModalPreference}
      variant="outline"
      size="sm"
      className="text-xs"
    >
      Reset Result Popups
    </Button>
  );
}
