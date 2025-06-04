
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Copy } from "lucide-react";

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TwoFactorModal = ({ isOpen, onClose }: TwoFactorModalProps) => {
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");
  
  const secretKey = "JBSWY3DPEHPK3PXP";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/EnvSync:john@example.com?secret=${secretKey}&issuer=EnvSync`;

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      // Here you would verify the code
      onClose();
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secretKey);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-electric_indigo-500" />
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          </div>
        </DialogHeader>
        
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Scan the QR code with your authenticator app, or enter the secret key manually.
            </p>
            
            <div className="flex justify-center">
              <img src={qrCodeUrl} alt="QR Code" className="border border-gray-600 rounded" />
            </div>
            
            <div className="space-y-2">
              <Label>Secret Key</Label>
              <div className="flex space-x-2">
                <Input
                  value={secretKey}
                  readOnly
                  className="bg-gray-900 border-gray-700 text-white font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copySecret}
                  className="border-gray-600 hover:bg-gray-700"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} className="border-gray-600 text-white hover:bg-gray-700">
                Cancel
              </Button>
              <Button onClick={() => setStep(2)} className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white">
                Continue
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Enter the 6-digit code from your authenticator app to complete setup.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="bg-gray-900 border-gray-700 text-white text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="border-gray-600 text-white hover:bg-gray-700">
                Back
              </Button>
              <Button 
                onClick={handleVerify} 
                disabled={verificationCode.length !== 6}
                className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white disabled:opacity-50"
              >
                Verify & Enable
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
