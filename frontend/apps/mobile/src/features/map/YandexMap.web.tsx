import { useEffect, useRef, useState } from 'react';

import { EKATERINBURG_CENTER } from '../../entities/place/places';
import { colors } from '../../shared/theme/colors';
import type { YandexMapProps } from './YandexMap.types';

// Глобальный объект Yandex Maps 2.1 с их CDN.
declare global {
  interface Window {
    ymaps?: any;
  }
}

const SCRIPT_ID = 'yandex-maps-v21-sdk';
// JS API 2.1 — зрелая версия, стандартный ключ «JavaScript API и HTTP Геокодер»
// из кабинета разработчика работает с ней из коробки.
const SDK_URL = (key: string) =>
  `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(key)}&lang=ru_RU`;

let loaderPromise: Promise<any> | null = null;

function loadYandexMaps(apiKey: string): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('no window'));
  }
  if (window.ymaps) return Promise.resolve(window.ymaps);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(window.ymaps));
      existing.addEventListener('error', (event) => {
        loaderPromise = null;
        existing.remove();
        reject(event);
      });
      return;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SDK_URL(apiKey);
    script.async = true;
    script.onload = () => resolve(window.ymaps);
    script.onerror = (event) => {
      // Сбрасываем кэш промиса, чтобы после правки ключа перезагрузка оживила SDK.
      loaderPromise = null;
      script.remove();
      reject(event);
    };
    document.head.appendChild(script);
  });

  return loaderPromise;
}

export function YandexMap({
  places,
  selectedId,
  onSelect,
  center,
  zoom = 13,
}: YandexMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const apiKey = process.env.EXPO_PUBLIC_YANDEX_JS_API_KEY;
  const [sdkError, setSdkError] = useState(false);

  useEffect(() => {
    if (!apiKey || !containerRef.current) return;

    let cancelled = false;
    const container = containerRef.current;

    setSdkError(false);

    loadYandexMaps(apiKey)
      .then(
        (ymaps) =>
          new Promise<any>((resolve) => {
            ymaps.ready(() => resolve(ymaps));
          }),
      )
      .then((ymaps) => {
        if (cancelled || !container) return;

        if (mapRef.current) {
          mapRef.current.destroy();
          mapRef.current = null;
        }

        // Важно: в 2.1 координаты идут [lat, lng] (в 3.0 было наоборот).
        const map = new ymaps.Map(container, {
          center: [
            center?.lat ?? EKATERINBURG_CENTER.lat,
            center?.lng ?? EKATERINBURG_CENTER.lng,
          ],
          zoom,
          controls: ['zoomControl', 'geolocationControl'],
        });
        mapRef.current = map;

        for (const place of places) {
          const placemark = new ymaps.Placemark(
            [place.lat, place.lng],
            {
              hintContent: place.name,
              balloonContentHeader: place.name,
              balloonContentBody: place.description,
              balloonContentFooter: place.address,
            },
            {
              preset: 'islands#circleDotIcon',
              iconColor:
                place.id === selectedId ? colors.textPrimary : colors.welcomeCta,
            },
          );
          placemark.events.add('click', () => onSelect?.(place.id));
          map.geoObjects.add(placemark);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Yandex Maps SDK load failed', err);
        setSdkError(true);
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [apiKey, places, selectedId, center?.lat, center?.lng, zoom, onSelect]);

  if (!apiKey) {
    return (
      <div style={overlayStyle}>
        <div style={overlayTitleStyle}>Карта не настроена</div>
        <div style={overlayBodyStyle}>
          Добавьте <code>EXPO_PUBLIC_YANDEX_JS_API_KEY</code> в
          <br />
          <code>frontend/apps/mobile/.env</code>
          <br />
          и перезапустите Metro с флагом <code>--clear</code>.
        </div>
      </div>
    );
  }

  if (sdkError) {
    const testUrl = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    return (
      <div style={overlayStyle}>
        <div style={overlayTitleStyle}>Не удалось загрузить карту</div>
        <div style={overlayBodyStyle}>
          Откройте ссылку ниже в новой вкладке — Яндекс покажет настоящую
          причину (невалидный ключ, ограничение по домену и т.д.):
          <div style={{ marginTop: 10 }}>
            <a
              href={testUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: colors.textPrimary, wordBreak: 'break-all' }}
            >
              {testUrl}
            </a>
          </div>
          <ul style={{ textAlign: 'left', margin: '12px 0 0', paddingLeft: 20 }}>
            <li>
              в кабинете разработчика должен быть сервис «<b>JavaScript API и
              HTTP Геокодер</b>»;
            </li>
            <li>
              в настройках ключа → «HTTP-рефереры» — либо очистить список,
              либо добавить <code>localhost</code> и <code>localhost:8081</code>;
            </li>
            <li>ключу может требоваться до пары часов на активацию;</li>
            <li>проверьте блокировщики/VPN, режущие <code>api-maps.yandex.ru</code>.</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: 240 }}
    />
  );
}

const overlayStyle: React.CSSProperties = {
  flex: 1,
  width: '100%',
  height: '100%',
  minHeight: 240,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  backgroundColor: '#EFE9DF',
  color: colors.textPrimary,
  fontSize: 13,
  textAlign: 'center',
  gap: 8,
};

const overlayTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
};

const overlayBodyStyle: React.CSSProperties = {
  maxWidth: 420,
  lineHeight: 1.45,
  color: colors.textMuted,
};
