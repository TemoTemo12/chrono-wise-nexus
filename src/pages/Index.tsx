import { useState, useEffect } from 'react';
import { Calendar } from '@/components/Calendar';
import { Weather } from '@/components/Weather';
import { DayPanel } from '@/components/DayPanel';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Calendar */}
          <div className="lg:col-span-1">
            <Calendar 
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              isDarkMode={isDarkMode}
              onToggleDarkMode={toggleDarkMode}
            />
          </div>

          {/* Middle Column - Day Panel */}
          <div className="lg:col-span-1">
            <DayPanel selectedDate={selectedDate} />
          </div>

          {/* Right Column - Weather */}
          <div className="lg:col-span-1">
            <Weather />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
