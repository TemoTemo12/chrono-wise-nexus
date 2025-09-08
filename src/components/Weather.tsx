import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer, Droplets, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WeatherData {
  location: string;
  current: {
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    visibility: number;
    icon: string;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
  }>;
}

const getWeatherIcon = (condition: string) => {
  const normalizedCondition = condition.toLowerCase();
  if (normalizedCondition.includes('rain')) return CloudRain;
  if (normalizedCondition.includes('snow')) return CloudSnow;
  if (normalizedCondition.includes('cloud')) return Cloud;
  if (normalizedCondition.includes('wind')) return Wind;
  return Sun;
};

// Mock weather data - in a real app, you'd fetch from OpenWeatherMap API
const mockWeatherData: WeatherData = {
  location: "New York, NY",
  current: {
    temp: 72,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 8,
    visibility: 10,
    icon: "partly-cloudy"
  },
  forecast: [
    { date: "Today", high: 75, low: 65, condition: "Sunny", icon: "sunny" },
    { date: "Tomorrow", high: 73, low: 63, condition: "Partly Cloudy", icon: "partly-cloudy" },
    { date: "Wednesday", high: 69, low: 59, condition: "Rainy", icon: "rainy" }
  ]
};

export function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with mock data
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch from OpenWeatherMap:
        // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        // const data = await response.json();
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        setWeather(mockWeatherData);
      } catch (err) {
        setError('Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location:', position.coords.latitude, position.coords.longitude);
          // In a real app, use these coordinates to fetch weather
        },
        (error) => {
          setError('Location access denied');
        }
      );
    } else {
      setError('Geolocation not supported');
    }
  };

  if (loading) {
    return (
      <Card className="weather-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="h-8 bg-white/20 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-3 bg-white/20 rounded"></div>
              <div className="h-3 bg-white/20 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={requestLocation} variant="outline">
            Enable Location
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  const CurrentWeatherIcon = getWeatherIcon(weather.current.condition);

  return (
    <div className="space-y-4">
      {/* Current Weather */}
      <Card className="weather-card animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-white">
            <span className="text-lg">Current Weather</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={requestLocation}
              className="text-white hover:bg-white/20"
            >
              📍 {weather.location}
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <CurrentWeatherIcon className="h-12 w-12 text-white" />
              <div>
                <div className="text-3xl font-bold text-white">{weather.current.temp}°F</div>
                <div className="text-white/80">{weather.current.condition}</div>
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex items-center space-x-2 text-white/90">
              <Droplets className="h-4 w-4" />
              <span className="text-sm">{weather.current.humidity}%</span>
            </div>
            <div className="flex items-center space-x-2 text-white/90">
              <Wind className="h-4 w-4" />
              <span className="text-sm">{weather.current.windSpeed} mph</span>
            </div>
            <div className="flex items-center space-x-2 text-white/90">
              <Eye className="h-4 w-4" />
              <span className="text-sm">{weather.current.visibility} mi</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3-Day Forecast */}
      <Card className="card-gradient animate-slide-up">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">3-Day Forecast</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {weather.forecast.map((day, index) => {
              const DayIcon = getWeatherIcon(day.condition);
              return (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors hover-lift"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-3">
                    <DayIcon className="h-6 w-6 text-primary" />
                    <div>
                      <div className="font-medium">{day.date}</div>
                      <div className="text-sm text-muted-foreground">{day.condition}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{day.high}°</div>
                    <div className="text-sm text-muted-foreground">{day.low}°</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}