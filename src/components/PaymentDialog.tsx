import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  CheckCircle,
  Loader2,
  Shield,
  IndianRupee
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  doctorName: string;
  amount: number; // Amount in paise (e.g., 50000 = ₹500)
  onPaymentSuccess: () => void;
}

type PaymentMethod = "card" | "upi" | "netbanking" | "wallet";

export const PaymentDialog = ({
  open,
  onOpenChange,
  appointmentId,
  doctorName,
  amount,
  onPaymentSuccess,
}: PaymentDialogProps) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Form states for different payment methods
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const amountInRupees = amount / 100;

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    try {
      // Generate a dummy payment ID
      const dummyPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Update appointment with payment details
      const { error } = await supabase
        .from("appointments")
        .update({
          payment_status: "paid",
          payment_id: dummyPaymentId,
          payment_amount: amount,
        })
        .eq("id", appointmentId);

      if (error) throw error;

      setPaymentSuccess(true);
      
      toast({
        title: "Payment Successful!",
        description: `₹${amountInRupees} paid for consultation with ${doctorName}`,
      });

      // Delay before closing to show success animation
      setTimeout(() => {
        onPaymentSuccess();
        onOpenChange(false);
        setPaymentSuccess(false);
        resetForm();
      }, 2000);
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setUpiId("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
    setPaymentMethod("upi");
  };

  const isFormValid = () => {
    switch (paymentMethod) {
      case "upi":
        return upiId.includes("@") && upiId.length > 5;
      case "card":
        return (
          cardNumber.replace(/\s/g, "").length === 16 &&
          cardExpiry.length === 5 &&
          cardCvv.length === 3 &&
          cardName.length > 2
        );
      case "netbanking":
      case "wallet":
        return true;
      default:
        return false;
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  if (paymentSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-in zoom-in duration-300">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-600 mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground text-center">
              Your consultation with {doctorName} has been confirmed.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Complete Payment
          </DialogTitle>
          <DialogDescription>
            Pay for your video consultation with {doctorName}
          </DialogDescription>
        </DialogHeader>

        {/* Amount Display */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consultation Fee</p>
                <p className="text-2xl font-bold text-primary">₹{amountInRupees}</p>
              </div>
              <Badge variant="outline" className="gap-1">
                <Shield className="h-3 w-3" />
                Secure
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <Label>Select Payment Method</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={paymentMethod === "upi" ? "default" : "outline"}
              className="h-16 flex flex-col gap-1"
              onClick={() => setPaymentMethod("upi")}
            >
              <Smartphone className="h-5 w-5" />
              <span className="text-xs">UPI</span>
            </Button>
            <Button
              type="button"
              variant={paymentMethod === "card" ? "default" : "outline"}
              className="h-16 flex flex-col gap-1"
              onClick={() => setPaymentMethod("card")}
            >
              <CreditCard className="h-5 w-5" />
              <span className="text-xs">Card</span>
            </Button>
            <Button
              type="button"
              variant={paymentMethod === "netbanking" ? "default" : "outline"}
              className="h-16 flex flex-col gap-1"
              onClick={() => setPaymentMethod("netbanking")}
            >
              <Building2 className="h-5 w-5" />
              <span className="text-xs">Net Banking</span>
            </Button>
            <Button
              type="button"
              variant={paymentMethod === "wallet" ? "default" : "outline"}
              className="h-16 flex flex-col gap-1"
              onClick={() => setPaymentMethod("wallet")}
            >
              <Wallet className="h-5 w-5" />
              <span className="text-xs">Wallet</span>
            </Button>
          </div>
        </div>

        {/* Payment Method Forms */}
        <div className="space-y-4">
          {paymentMethod === "upi" && (
            <div className="space-y-2">
              <Label htmlFor="upi">UPI ID</Label>
              <Input
                id="upi"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your UPI ID (e.g., name@paytm, name@ybl)
              </p>
            </div>
          )}

          {paymentMethod === "card" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                    maxLength={3}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
            </div>
          )}

          {paymentMethod === "netbanking" && (
            <div className="space-y-2">
              <Label>Select Bank</Label>
              <div className="grid grid-cols-2 gap-2">
                {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "Yes Bank"].map((bank) => (
                  <Button
                    key={bank}
                    type="button"
                    variant="outline"
                    className="h-12"
                    onClick={() => {}}
                  >
                    {bank}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {paymentMethod === "wallet" && (
            <div className="space-y-2">
              <Label>Select Wallet</Label>
              <div className="grid grid-cols-2 gap-2">
                {["Paytm", "PhonePe", "Amazon Pay", "Mobikwik"].map((wallet) => (
                  <Button
                    key={wallet}
                    type="button"
                    variant="outline"
                    className="h-12"
                    onClick={() => {}}
                  >
                    {wallet}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pay Button */}
        <Button
          className="w-full h-12 text-lg"
          onClick={handlePayment}
          disabled={processing || !isFormValid()}
        >
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>Pay ₹{amountInRupees}</>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          This is a demo payment. No actual charges will be made.
        </p>
      </DialogContent>
    </Dialog>
  );
};
