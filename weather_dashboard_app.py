#!/usr/bin/env python3
"""
Weather Dashboard - Standalone Python App
A desktop weather application using tkinter
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import requests
import json
from datetime import datetime
import threading
from PIL import Image, ImageTk
from io import BytesIO
import os

class WeatherDashboard:
    def __init__(self, root):
        self.root = root
        self.root.title("Weather Dashboard")
        self.root.geometry("1000x700")
        self.root.resizable(True, True)
        
        # API Configuration
        self.API_KEY = "YOUR_API_KEY_HERE"  # Get from openweathermap.org
        self.WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"
        self.FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast"
        self.GEO_API_URL = "https://api.openweathermap.org/geo/1.0/direct"
        
        # Weather icon mapping
        self.weather_icons = {
            '01d': '☀️', '01n': '🌙',
            '02d': '⛅', '02n': '🌙',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        }
        
        # Setup UI
        self.setup_ui()
        
        # Check API key on startup
        self.check_api_key()
    
    def setup_ui(self):
        """Create the user interface"""
        # Configure style
        style = ttk.Style()
        style.theme_use('clam')
        
        # Header Frame
        header = ttk.Frame(self.root)
        header.pack(side=tk.TOP, fill=tk.X, padx=10, pady=10)
        
        ttk.Label(header, text="🌤️ Weather Dashboard", font=("Arial", 20, "bold")).pack(side=tk.LEFT)
        
        # Search Frame
        search_frame = ttk.Frame(self.root)
        search_frame.pack(side=tk.TOP, fill=tk.X, padx=10, pady=5)
        
        ttk.Label(search_frame, text="City:").pack(side=tk.LEFT, padx=5)
        
        self.search_var = tk.StringVar()
        self.search_entry = ttk.Entry(search_frame, textvariable=self.search_var, width=30)
        self.search_entry.pack(side=tk.LEFT, padx=5)
        self.search_entry.bind('<Return>', lambda e: self.search_weather())
        
        ttk.Button(search_frame, text="Search", command=self.search_weather).pack(side=tk.LEFT, padx=2)
        ttk.Button(search_frame, text="📍 My Location", command=self.use_location).pack(side=tk.LEFT, padx=2)
        ttk.Button(search_frame, text="⚙️ Settings", command=self.open_settings).pack(side=tk.LEFT, padx=2)
        
        # Main Content Area
        self.main_frame = ttk.Frame(self.root)
        self.main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Current Weather Panel
        self.current_frame = ttk.LabelFrame(self.main_frame, text="Current Weather", padding=10)
        self.current_frame.pack(fill=tk.X, padx=5, pady=5)
        
        self.weather_label = ttk.Label(self.current_frame, text="Select a city to view weather...", 
                                       font=("Arial", 14))
        self.weather_label.pack()
        
        # Forecast Panel
        self.forecast_frame = ttk.LabelFrame(self.main_frame, text="5-Day Forecast", padding=10)
        self.forecast_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        self.forecast_text = scrolledtext.ScrolledText(self.forecast_frame, height=10, width=80)
        self.forecast_text.pack(fill=tk.BOTH, expand=True)
        self.forecast_text.config(state=tk.DISABLED)
        
        # Status Bar
        self.status_var = tk.StringVar(value="Ready")
        status_bar = ttk.Label(self.root, textvariable=self.status_var, relief=tk.SUNKEN)
        status_bar.pack(side=tk.BOTTOM, fill=tk.X, padx=5, pady=5)
    
    def check_api_key(self):
        """Check if API key is configured"""
        if self.API_KEY == "YOUR_API_KEY_HERE":
            messagebox.showwarning(
                "API Key Missing",
                "Please configure your OpenWeatherMap API key:\n\n"
                "1. Visit: https://openweathermap.org/api\n"
                "2. Sign up for free\n"
                "3. Get your API key\n"
                "4. Click Settings button and enter it\n\n"
                "Or edit the script and replace 'YOUR_API_KEY_HERE'"
            )
    
    def open_settings(self):
        """Open settings window"""
        settings_window = tk.Toplevel(self.root)
        settings_window.title("Settings")
        settings_window.geometry("400x200")
        
        ttk.Label(settings_window, text="OpenWeatherMap API Key:", font=("Arial", 10)).pack(pady=10)
        
        api_var = tk.StringVar(value=self.API_KEY)
        api_entry = ttk.Entry(settings_window, textvariable=api_var, width=40, show="*")
        api_entry.pack(pady=5, padx=10)
        
        ttk.Label(settings_window, text="Get your free key at:", foreground="blue").pack(pady=5)
        ttk.Label(settings_window, text="https://openweathermap.org/api", 
                 foreground="blue", font=("Arial", 9)).pack()
        
        def save_settings():
            self.API_KEY = api_var.get()
            messagebox.showinfo("Success", "API key saved!")
            settings_window.destroy()
        
        ttk.Button(settings_window, text="Save", command=save_settings).pack(pady=10)
    
    def search_weather(self):
        """Search weather for a city"""
        city = self.search_var.get().strip()
        if not city:
            messagebox.showwarning("Input Error", "Please enter a city name")
            return
        
        self.status_var.set(f"Searching for {city}...")
        self.root.update()
        
        # Run in thread to avoid freezing
        thread = threading.Thread(target=self._fetch_weather, args=(city,))
        thread.daemon = True
        thread.start()
    
    def use_location(self):
        """Use device location"""
        messagebox.showinfo("Location", "Location feature requires additional setup.\n"
                           "Please manually search for your city for now.")
    
    def _fetch_weather(self, city):
        """Fetch weather data (runs in thread)"""
        try:
            if self.API_KEY == "YOUR_API_KEY_HERE":
                self.update_status("Error: API key not configured")
                return
            
            # Get coordinates for city
            geo_response = requests.get(
                f"{self.GEO_API_URL}?q={city}&limit=1&appid={self.API_KEY}",
                timeout=5
            )
            
            if geo_response.status_code != 200:
                self.update_status("City not found")
                return
            
            geo_data = geo_response.json()
            if not geo_data:
                self.update_status("City not found")
                return
            
            lat, lon = geo_data[0]['lat'], geo_data[0]['lon']
            city_name = geo_data[0]['name']
            
            # Get current weather
            weather_response = requests.get(
                f"{self.WEATHER_API_URL}?lat={lat}&lon={lon}&units=metric&appid={self.API_KEY}",
                timeout=5
            )
            
            # Get forecast
            forecast_response = requests.get(
                f"{self.FORECAST_API_URL}?lat={lat}&lon={lon}&units=metric&appid={self.API_KEY}",
                timeout=5
            )
            
            if weather_response.status_code == 200:
                self.display_weather(weather_response.json(), city_name)
            
            if forecast_response.status_code == 200:
                self.display_forecast(forecast_response.json())
            
            self.update_status(f"Weather for {city_name} loaded successfully")
            
        except requests.exceptions.Timeout:
            self.update_status("Request timeout - check your internet connection")
        except requests.exceptions.RequestException as e:
            self.update_status(f"Error: {str(e)}")
        except Exception as e:
            self.update_status(f"Error: {str(e)}")
    
    def display_weather(self, data, city_name):
        """Display current weather"""
        try:
            main = data['main']
            weather = data['weather'][0]
            wind = data['wind']
            
            icon = self.weather_icons.get(weather['icon'], '🌤️')
            
            weather_text = f"""
{icon} {city_name}
Temperature: {main['temp']:.1f}°C (Feels like {main['feels_like']:.1f}°C)
Condition: {weather['description'].title()}
Humidity: {main['humidity']}%
Wind Speed: {wind['speed']*3.6:.1f} km/h
Pressure: {main['pressure']} hPa
            """
            
            self.weather_label.config(text=weather_text)
            
        except Exception as e:
            self.weather_label.config(text=f"Error displaying weather: {str(e)}")
    
    def display_forecast(self, data):
        """Display 5-day forecast"""
        try:
            self.forecast_text.config(state=tk.NORMAL)
            self.forecast_text.delete(1.0, tk.END)
            
            daily_data = {}
            for item in data['list']:
                date = datetime.fromtimestamp(item['dt']).strftime('%a, %b %d')
                
                if date not in daily_data:
                    daily_data[date] = {
                        'temps': [],
                        'weather': item['weather'][0],
                        'rain': 0
                    }
                
                daily_data[date]['temps'].append(item['main']['temp'])
                if 'rain' in item:
                    daily_data[date]['rain'] += item['rain'].get('3h', 0)
            
            forecast_text = "5-DAY FORECAST\n" + "="*60 + "\n\n"
            
            for i, (date, data_item) in enumerate(list(daily_data.items())[:5]):
                icon = self.weather_icons.get(data_item['weather']['icon'], '🌤️')
                max_temp = max(data_item['temps'])
                min_temp = min(data_item['temps'])
                
                forecast_text += f"{icon} {date}\n"
                forecast_text += f"   High: {max_temp:.1f}°C | Low: {min_temp:.1f}°C\n"
                forecast_text += f"   {data_item['weather']['description'].title()}\n"
                forecast_text += f"   Precipitation: {data_item['rain']:.1f}mm\n\n"
            
            self.forecast_text.insert(tk.END, forecast_text)
            self.forecast_text.config(state=tk.DISABLED)
            
        except Exception as e:
            self.forecast_text.config(state=tk.NORMAL)
            self.forecast_text.delete(1.0, tk.END)
            self.forecast_text.insert(tk.END, f"Error displaying forecast: {str(e)}")
            self.forecast_text.config(state=tk.DISABLED)
    
    def update_status(self, message):
        """Update status bar safely"""
        self.root.after(0, lambda: self.status_var.set(message))


def main():
    """Main entry point"""
    root = tk.Tk()
    
    # Set icon (if available)
    try:
        root.iconbitmap('weather.ico')
    except:
        pass
    
    app = WeatherDashboard(root)
    root.mainloop()


if __name__ == "__main__":
    main()