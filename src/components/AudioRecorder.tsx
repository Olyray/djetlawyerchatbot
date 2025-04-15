import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  IconButton, 
  Text, 
  Tooltip,
  useColorModeValue,
  HStack
} from '@chakra-ui/react';
import { Icon } from '@iconify/react';

interface AudioRecorderProps {
  onAudioRecorded: (audioBlob: Blob) => void;
  onCancel: () => void;
}

// Main AudioRecorder component to handle voice recording for the chatbot
const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioRecorded,
  onCancel
}) => {
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Visualization state
  const [audioVisualization, setAudioVisualization] = useState<number[]>([]);
  
  // Refs for recording and timers
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Colors for UI elements
  const recordingColor = useColorModeValue('red.500', 'red.300');
  const visualizationColor = useColorModeValue('brand.500', 'brand.300');
  const buttonBg = useColorModeValue('#f4965c', '#f4965c');
  const buttonHoverBg = useColorModeValue('#e27d42', '#e27d42');
  const buttonBorderColor = useColorModeValue('#e88745', '#e88745');
  
  // Auto-start recording when component mounts
  useEffect(() => {
    startRecording();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Start recording function
  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio context for visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;
      source.connect(analyser);
      
      // Start visualization
      visualizeAudio();
      
      // Check for supported MIME types (prefer OGG for Gemini API compatibility)
      let mimeType = 'audio/ogg';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Fallbacks in order of preference for Gemini compatibility
        const fallbacks = ['audio/wav', 'audio/mp3', 'audio/aiff', 'audio/aac', 'audio/flac'];
        for (const fallback of fallbacks) {
          if (MediaRecorder.isTypeSupported(fallback)) {
            mimeType = fallback;
            console.log(`Using fallback audio format: ${mimeType}`);
            break;
          }
        }
      }
      
      // Create MediaRecorder instance with the supported format
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      
      // Reset audio chunks
      audioChunksRef.current = [];
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Create audio blob when recording is stopped
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(audioBlob);
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
        
        // Clear visualization interval
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      
      // Start recording timer
      startTimer();
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };
  
  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopTimer();
    }
  };
  
  // Pause recording function
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
    }
  };
  
  // Resume recording function
  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    }
  };
  
  // Timer functions
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prevTime => prevTime + 1);
    }, 1000);
  };
  
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  // Audio visualization function
  const visualizeAudio = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateVisualization = () => {
      if (!analyserRef.current || !isRecording) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Sample data for visualization (taking every 8th value for performance)
      const sampledData = Array.from({ length: 20 }, (_, i) => 
        dataArray[Math.floor(i * (bufferLength / 20))] / 255 * 100
      );
      
      setAudioVisualization(sampledData);
      
      if (isRecording) {
        requestAnimationFrame(updateVisualization);
      }
    };
    
    updateVisualization();
  };
  
  // Play recorded audio
  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  // Pause playback
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  // Format time for display (MM:SS)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle audio playback end
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };
  
  // Submit recorded audio
  const handleSubmit = () => {
    if (audioBlob) {
      onAudioRecorded(audioBlob);
    }
  };
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [isRecording, audioUrl]);
  
  return (
    <Box width="100%">
      {/* Audio element for playback (hidden) */}
      <audio 
        ref={audioRef} 
        src={audioUrl || ''} 
        onEnded={handleAudioEnded} 
        style={{ display: 'none' }}
      />
      
      {/* Audio visualization */}
      {isRecording && (
        <Flex 
          justifyContent="center" 
          alignItems="flex-end" 
          height="60px" 
          my={2} 
          gap={1}
        >
          {audioVisualization.map((value, index) => (
            <Box
              key={index}
              width="8px"
              height={`${Math.max(10, value)}%`}
              bg={visualizationColor}
              borderRadius="sm"
              transition="height 0.1s ease"
            />
          ))}
          {/* Show recording time */}
          <Text 
            position="absolute" 
            fontSize="sm" 
            color={recordingColor}
            fontWeight="bold"
          >
            {isPaused ? 'PAUSED ' : 'REC '} {formatTime(recordingTime)}
          </Text>
        </Flex>
      )}
      
      {/* Recording controls */}
      {isRecording ? (
        <HStack spacing={2} justifyContent="center" mb={3}>
          {isPaused ? (
            <Tooltip label="Resume recording">
              <IconButton
                aria-label="Resume recording"
                icon={<Icon icon="ic:baseline-play-arrow" width="24px" height="24px" />}
                onClick={resumeRecording}
                bg={buttonBg}
                _hover={{ bg: buttonHoverBg }}
                borderRadius="full"
                size="md"
                border="1px solid"
                borderColor={buttonBorderColor}
                boxShadow="sm"
              />
            </Tooltip>
          ) : (
            <Tooltip label="Pause recording">
              <IconButton
                aria-label="Pause recording"
                icon={<Icon icon="ic:baseline-pause" width="24px" height="24px" />}
                onClick={pauseRecording}
                bg={buttonBg}
                _hover={{ bg: buttonHoverBg }}
                borderRadius="full"
                size="md"
                border="1px solid"
                borderColor={buttonBorderColor}
                boxShadow="sm"
              />
            </Tooltip>
          )}
          
          <Tooltip label="Stop recording">
            <IconButton
              aria-label="Stop recording"
              icon={<Icon icon="ic:baseline-stop" width="24px" height="24px" />}
              onClick={stopRecording}
              bg={buttonBg}
              _hover={{ bg: buttonHoverBg }}
              borderRadius="full"
              size="md"
              color={recordingColor}
              border="1px solid"
              borderColor={buttonBorderColor}
              boxShadow="sm"
            />
          </Tooltip>
          
          <Tooltip label="Cancel recording">
            <IconButton
              aria-label="Cancel recording"
              icon={<Icon icon="ic:baseline-close" width="24px" height="24px" />}
              onClick={onCancel}
              bg={buttonBg}
              _hover={{ bg: buttonHoverBg }}
              borderRadius="full"
              size="md"
              border="1px solid"
              borderColor={buttonBorderColor}
              boxShadow="sm"
            />
          </Tooltip>
        </HStack>
      ) : !audioBlob ? (
        <Flex justifyContent="center" mb={3}>
          <Tooltip label="Start recording">
            <IconButton
              aria-label="Start recording"
              icon={<Icon icon="ic:baseline-mic" width="24px" height="24px" />}
              onClick={startRecording}
              bg={buttonBg}
              _hover={{ bg: buttonHoverBg }}
              borderRadius="full"
              size="md"
              border="1px solid"
              borderColor={buttonBorderColor}
              boxShadow="sm"
            />
          </Tooltip>
        </Flex>
      ) : (
        <HStack spacing={2} justifyContent="center" mb={3}>
          {isPlaying ? (
            <Tooltip label="Pause playback">
              <IconButton
                aria-label="Pause playback"
                icon={<Icon icon="ic:baseline-pause" width="24px" height="24px" />}
                onClick={pauseAudio}
                bg={buttonBg}
                _hover={{ bg: buttonHoverBg }}
                borderRadius="full"
                size="md"
                border="1px solid"
                borderColor={buttonBorderColor}
                boxShadow="sm"
              />
            </Tooltip>
          ) : (
            <Tooltip label="Play recording">
              <IconButton
                aria-label="Play recording"
                icon={<Icon icon="ic:baseline-play-arrow" width="24px" height="24px" />}
                onClick={playAudio}
                bg={buttonBg}
                _hover={{ bg: buttonHoverBg }}
                borderRadius="full"
                size="md"
                border="1px solid"
                borderColor={buttonBorderColor}
                boxShadow="sm"
              />
            </Tooltip>
          )}
          
          <Tooltip label="Submit recording">
            <IconButton
              aria-label="Submit recording"
              icon={<Icon icon="ic:baseline-send" width="24px" height="24px" />}
              onClick={handleSubmit}
              bg={buttonBg}
              _hover={{ bg: buttonHoverBg }}
              borderRadius="full"
              size="md"
              colorScheme="brand"
              border="1px solid"
              borderColor={buttonBorderColor}
              boxShadow="sm"
            />
          </Tooltip>
          
          <Tooltip label="Record again">
            <IconButton
              aria-label="Record again"
              icon={<Icon icon="ic:baseline-restart-alt" width="24px" height="24px" />}
              onClick={() => {
                setAudioBlob(null);
                setAudioUrl(null);
                setRecordingTime(0);
                startRecording();
              }}
              bg={buttonBg}
              _hover={{ bg: buttonHoverBg }}
              borderRadius="full"
              size="md"
              border="1px solid"
              borderColor={buttonBorderColor}
              boxShadow="sm"
            />
          </Tooltip>
          
          <Tooltip label="Cancel">
            <IconButton
              aria-label="Cancel"
              icon={<Icon icon="ic:baseline-close" width="24px" height="24px" />}
              onClick={onCancel}
              bg={buttonBg}
              _hover={{ bg: buttonHoverBg }}
              borderRadius="full"
              size="md"
              border="1px solid"
              borderColor={buttonBorderColor}
              boxShadow="sm"
            />
          </Tooltip>
        </HStack>
      )}
    </Box>
  );
};

export default AudioRecorder; 