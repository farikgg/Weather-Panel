const apiKey = 'cf42f927c6889ee696ec70871e37e270';

const weatherInfo = document.getElementById('weather-info');
const errorDiv = document.getElementById('error');
const cityInput = document.getElementById('city-input');
const weatherBtn = document.getElementById('get-weather');
const addToFavoritesBtn = document.getElementById('add-to-favorites');
const languageSelect = document.getElementById('language-select');

// Объект для переводов
const translations = {
  en: {
    current_time: 'Current time',
    temperature: 'Temperature',
    feels_like: 'Feels like',
    humidity: 'Humidity',
    pressure: 'Pressure',
    condition: 'Condition',
    wind_speed: 'Wind Speed',
    cloudiness: 'Cloudiness',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    city_not_found: 'City not found',
    enter_city: 'Please enter a city',
    add_to_favorites: 'Add to Favorites',
    get_weather: 'Weather forecast',
    remove_from_favorites: 'Delete'
  },
  ru: {
    current_time: 'Текущее время',
    temperature: 'Температура',
    feels_like: 'Ощущается как',
    humidity: 'Влажность',
    pressure: 'Давление',
    condition: 'Состояние',
    wind_speed: 'Скорость ветра',
    cloudiness: 'Облачность',
    sunrise: 'Восход',
    sunset: 'Закат',
    city_not_found: 'Город не найден',
    enter_city: 'Пожалуйста, введите город',
    add_to_favorites: 'Добавить в избранное',
    get_weather: 'Прогноз погоды',
    remove_from_favorites: 'Удалить' 
  }
};
// Уведомления вместо alert
function showNotification(message, type = 'info') {
  const notificationContainer = document.getElementById('notification-container');
  
  // Создаем уведомление
  const notification = document.createElement('div');
  notification.classList.add('notification', type);
  notification.textContent = message;
  
  // Добавляем уведомление в контейнер
  notificationContainer.append(notification);
  
  // Автоматически скрываем уведомление через 3 секунды
  setTimeout(() => {
    notification.remove();
  }, 3000);
}


// Текущий язык
let currentLang = 'en';
languageSelect.textContent = 'RU'; 

// Функция для получения перевода
function translate(key) {
  return translations[currentLang][key];
}

// Функция для получения данных о погоде
async function getWeather(city) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
    if (!response.ok) {
      throw new Error(translate('city_not_found')); 
    }
    const data = await response.json();
    displayWeather(data);
  } catch (error) {
    showNotification(error.message, 'error');
  }
}


// Смена языка
languageSelect.addEventListener('click', () => {
  if (currentLang === 'en') {
    currentLang = 'ru';
    languageSelect.textContent = 'EN'; 
  } else {
    currentLang = 'en';
    languageSelect.textContent = 'RU';
  }

  weatherBtn.textContent = translate('get_weather');
  addToFavoritesBtn.textContent = translate('add_to_favorites');

  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
  }
});

// Функция данных о погоде
function displayWeather(data) {
  const { main, weather, wind, clouds, sys, dt } = data;

  // Получаем время в UNIX-формате и преобразуем в человекочитаемое
  const currentTime = new Date(dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunrise = new Date(sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  weatherInfo.innerHTML = `
    <div class="weather-card"><strong>${translate('current_time')}</strong> ${currentTime}</div>
    <div class="weather-card"><strong>${translate('temperature')}</strong> ${main.temp}°C</div>
    <div class="weather-card"><strong>${translate('feels_like')}</strong> ${main.feels_like}°C</div>
    <div class="weather-card"><strong>${translate('humidity')}</strong> ${main.humidity}%</div>
    <div class="weather-card"><strong>${translate('pressure')}</strong> ${main.pressure} hPa</div>
    <div class="weather-card"><strong>${translate('condition')}</strong> ${weather[0].description}</div>
    <div class="weather-card"><strong>${translate('wind_speed')}</strong> ${wind.speed} m/s</div>
    <div class="weather-card"><strong>${translate('cloudiness')}</strong> ${clouds.all}%</div>
    <div class="weather-card"><strong>${translate('sunrise')}</strong> ${sunrise}</div>
    <div class="weather-card"><strong>${translate('sunset')}</strong> ${sunset}</div>
  `;

  addToFavoritesBtn.style.display = 'inline-block';
}

weatherBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
  } else {
    errorDiv.textContent = translate('enter_city');
  }
});

let favoriteCities = [];

const MAX_FAVORITE_CITIES = 10;

// Добавляем город в избранное
function addToFavorites(city, data) {
  if (favoriteCities.length >= MAX_FAVORITE_CITIES) {
    showNotification(`You can only add up to ${MAX_FAVORITE_CITIES} cities.`, 'error');
    return;
  }
  const formattedCity = city.toLowerCase();
  if (favoriteCities.find(favCity => favCity.name.toLowerCase() === formattedCity)) {
    showNotification('City is already in favorites.', 'error');
    return;
  }

  // Добавляем город с данными
  favoriteCities.push({
    name: capitalizeCity(formattedCity),
    temperature: data.main.temp,
    condition: data.weather[0].description,
    currentTime: new Date(data.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  renderFavoriteCities();
  showNotification(`${capitalizeCity(city)} added to favorites!`, 'success');
}

// Метод для Избранных Имен Города
function capitalizeCity(city) {
  return city.charAt(0).toUpperCase() + city.slice(1);
}

// Функция для удаления города из избранного
function removeFromFavorites(cityName) {
  favoriteCities = favoriteCities.filter(city => city.name !== cityName);
  renderFavoriteCities(); // Обновляем отображение
}

// Функция для отображения избранных городов
function renderFavoriteCities() {
  const favoriteCitiesContainer = document.getElementById('favorite-cities');
  favoriteCitiesContainer.innerHTML = ''; // очищаем контейнер

  favoriteCities.forEach(city => {
    const cityCard = document.createElement('div');
    cityCard.classList.add('favorite-city-card');

    cityCard.innerHTML = `
      <h3>${city.name}</h3>
      <p>${city.temperature}°C</p>
      <p>${city.currentTime}</p>
      <p>${city.condition}</p>
      <button class="remove-city-btn">${translate('remove_from_favorites')}</button>
    `;

    // Добавляем обработчик для удаления города
    const removeBtn = cityCard.querySelector('.remove-city-btn');
    removeBtn.addEventListener('click', () => removeFromFavorites(city.name));

    favoriteCitiesContainer.append(cityCard);
  });
}

// Обработка для кнопки "Добавить в избранное"
addToFavoritesBtn.addEventListener('click', async () => {
  const city = cityInput.value.trim();
  if (!city) return showNotification(`Add a city`, 'error');

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
    if (!response.ok) {
      throw new Error(translate('city_not_found'));
    }

    const data = await response.json();
    addToFavorites(city, data); // Добавляем город в избранное
  } catch (error) {
    showNotification(`${error.message}`, 'error'); // Показать ошибку если не удалось получить данные
  }
});

// Функция для переключения темы
function toggleTheme() {
  const body = document.body;
  const currentTheme = body.classList.contains('dark-theme');

  if (currentTheme) {
    body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light'); // Сохраняем выбранную тему в localStorage
  } else {
    body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  }
}

// При загрузке страницы проверим сохраненную тему
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }
});

// Вешаем обработчик на кнопку переключения темы
const themeButton = document.getElementById('theme-toggle');
if (themeButton) {
  themeButton.addEventListener('click', toggleTheme);
}
