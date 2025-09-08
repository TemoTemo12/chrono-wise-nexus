import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Calendar({ selectedDate, onSelectDate, isDarkMode, onToggleDarkMode }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return day === selectedDate.getDate() &&
           currentMonth === selectedDate.getMonth() &&
           currentYear === selectedDate.getFullYear();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(currentYear, currentMonth, day);
      const today = isToday(day);
      const selected = isSelected(day);

      days.push(
        <button
          key={day}
          onClick={() => onSelectDate(dateObj)}
          className={`
            calendar-day h-12 flex items-center justify-center text-sm font-medium
            hover-lift animate-fade-in
            ${today ? 'today' : ''}
            ${selected ? 'selected' : ''}
          `}
          style={{ animationDelay: `${day * 10}ms` }}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <Card className="card-gradient">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Calendar
            </CardTitle>
          </div>
          
          {/* Real-time Clock */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-muted px-3 py-2 rounded-lg">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm font-semibold">
                {currentTime.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>
            
            {/* Dark Mode Toggle */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={onToggleDarkMode}
              className="hover-lift"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mt-4">
          <Button 
            variant="outline" 
            onClick={() => navigateMonth('prev')}
            className="hover-lift"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-xl font-semibold">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          
          <Button 
            variant="outline" 
            onClick={() => navigateMonth('next')}
            className="hover-lift"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {DAYS.map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {renderCalendarDays()}
        </div>
      </CardContent>
    </Card>
  );
}