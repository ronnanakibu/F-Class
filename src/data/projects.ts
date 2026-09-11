import type { Project } from '@/types';

export const projects: Project[] = [
  {
    id: 'prj-01',
    title: 'Smart Classroom Monitor',
    category: 'IoT',
    description:
      'Real-time environmental monitoring system for campus classrooms. Tracks temperature, humidity, air quality, and occupancy using distributed sensor nodes.',
    techStack: ['ESP32', 'MQTT', 'React', 'InfluxDB', 'Grafana'],
    team: ['Ahmad Rizky', 'Rendi Wahyu', 'Farhan Dwitama'],
    repoUrl: 'https://github.com/',
    demoUrl: '',
  },
  {
    id: 'prj-02',
    title: 'Traffic Light Controller FPGA',
    category: 'Embedded',
    description:
      'FPGA-based adaptive traffic light controller with real-time vehicle detection using IR sensors and configurable timing patterns via UART.',
    techStack: ['VHDL', 'Xilinx Vivado', 'FPGA', 'UART'],
    team: ['Dewi Anggraini', 'Ahmad Rizky'],
    repoUrl: 'https://github.com/',
  },
  {
    id: 'prj-03',
    title: 'CE F Class Portal',
    category: 'Web',
    description:
      'Full-stack class management platform with attendance tracking, grade visualization, and assignment submission. Built as a semester project.',
    techStack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Tailwind CSS'],
    team: ['Siti Nurhaliza', 'Putri Ramadhani', 'Indah Permata'],
    repoUrl: 'https://github.com/',
    demoUrl: '',
  },
  {
    id: 'prj-04',
    title: 'Hand Gesture Recognition',
    category: 'AI',
    description:
      'Computer vision model for real-time hand gesture recognition. Trained on custom dataset for controlling presentation slides hands-free.',
    techStack: ['Python', 'MediaPipe', 'TensorFlow', 'OpenCV'],
    team: ['Budi Santoso', 'Aisyah Fitri'],
    repoUrl: 'https://github.com/',
  },
  {
    id: 'prj-05',
    title: 'Automated PCB Soldering Station',
    category: 'Hardware',
    description:
      'Arduino-controlled soldering station with temperature PID control, programmable profiles, and OLED display interface.',
    techStack: ['Arduino Mega', 'PID Control', 'OLED SSD1306', 'C++'],
    team: ['Dewi Anggraini', 'Muhammad Fadlan'],
    repoUrl: 'https://github.com/',
  },
  {
    id: 'prj-06',
    title: 'Smart Door Lock System',
    category: 'IoT',
    description:
      'RFID and fingerprint-based access control system with mobile app integration, activity logging, and remote unlock capabilities.',
    techStack: ['ESP32', 'Flutter', 'Firebase', 'RFID RC522', 'Fingerprint R307'],
    team: ['Rendi Wahyu', 'Aisyah Fitri', 'Farhan Dwitama'],
    repoUrl: 'https://github.com/',
    demoUrl: '',
  },
];
