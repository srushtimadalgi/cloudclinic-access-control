import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, X, ExternalLink } from "lucide-react";

interface VideoConsultationProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  appointmentId: string;
  participantName: string;
}

export const VideoConsultation = ({
  isOpen,
  onClose,
  roomId,
  appointmentId,
  participantName
}: VideoConsultationProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generate Jitsi room URL - using the 8x8.vc public Jitsi instance
  const jitsiRoomUrl = `https://8x8.vc/cloudclinic-${roomId}#userInfo.displayName="${encodeURIComponent(participantName)}"`;

  const openInNewTab = () => {
    window.open(jitsiRoomUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'max-w-[95vw] h-[95vh]' : 'max-w-4xl h-[80vh]'} p-0`}>
        <DialogHeader className="px-4 py-2 border-b flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-healthcare-blue" />
            Video Consultation
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
              className="gap-1"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 h-full">
          <iframe
            src={jitsiRoomUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-full border-0"
            style={{ minHeight: isFullscreen ? 'calc(95vh - 60px)' : 'calc(80vh - 60px)' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to generate a room ID from appointment
export const generateVideoRoomId = (appointmentId: string): string => {
  return `apt-${appointmentId.slice(0, 8)}`;
};

// Component to show video call button for appointments
interface JoinVideoCallButtonProps {
  appointmentId: string;
  consultationType: string;
  status: string;
  participantName: string;
  onJoin?: () => void;
}

export const JoinVideoCallButton = ({
  appointmentId,
  consultationType,
  status,
  participantName,
  onJoin
}: JoinVideoCallButtonProps) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Only show for video consultations that are confirmed
  if (consultationType !== 'video' || status !== 'confirmed') {
    return null;
  }

  const roomId = generateVideoRoomId(appointmentId);

  return (
    <>
      <Button
        size="sm"
        onClick={() => {
          setIsVideoOpen(true);
          onJoin?.();
        }}
        className="bg-healthcare-blue hover:bg-healthcare-blue/90 gap-1"
      >
        <Video className="h-4 w-4" />
        Join Call
      </Button>
      <VideoConsultation
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        roomId={roomId}
        appointmentId={appointmentId}
        participantName={participantName}
      />
    </>
  );
};

export default VideoConsultation;
