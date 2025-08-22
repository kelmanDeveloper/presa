export default {
  db: null,
  inProgress: new Map(), // Для отслеживания активных загрузок

  // Инициализация базы данных
  async initDB() {
    if (!this.db) {
      const request = indexedDB.open("videoCacheDB", 1);

      return new Promise((resolve, reject) => {
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          db.createObjectStore("videos", { keyPath: "url" });
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          resolve();
        };

        request.onerror = () => {
          reject("Ошибка инициализации IndexedDB");
        };
      });
    }
  },

  // Сохранение медиа в кэш
  async saveVideo(url, mediaBlob) {
    await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["videos"], "readwrite");
      const store = transaction.objectStore("videos");

      const request = store.put({
        url,
        videoBlob: mediaBlob,
        timestamp: Date.now(), // Добавляем метку времени
      });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject("Ошибка сохранения медиа в IndexedDB");
      };
    });
  },

  // Получение медиа из кэша
  async getVideo(url) {
    await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["videos"], "readonly");
      const store = transaction.objectStore("videos");

      const request = store.get(url);

      request.onsuccess = (event) => {
        const result = event.target.result;
        if (result) {
          resolve(result.videoBlob);
        } else {
          reject(null); // Если нет в кэше, возвращаем null
        }
      };

      request.onerror = () => {
        reject("Ошибка получения медиа из IndexedDB");
      };
    });
  },

  // Проверка существования видео в кэше
  async exists(url) {
    await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["videos"], "readonly");
      const store = transaction.objectStore("videos");

      const request = store.getKey(url);

      request.onsuccess = (event) => {
        resolve(!!event.target.result); // Возвращает true, если ключ найден
      };

      request.onerror = () => {
        reject("Ошибка проверки существования объекта в IndexedDB");
      };
    });
  },

  // Загрузка видео с защитой от повторной загрузки
  async loadVideo(url) {
    if (this.inProgress.has(url)) {
      return this.inProgress.get(url); // Если загрузка уже идет, возвращаем промис
    }

    const videoPromise = new Promise(async (resolve, reject) => {
      try {
        const videoBlob = await this.getVideo(url).catch(() => null);
        if (videoBlob) {
          resolve(videoBlob);
        } else {
          const response = await fetch(url);
          const blob = await response.blob();
          await this.saveVideo(url, blob);
          resolve(blob);
        }
      } catch (error) {
        reject(error);
      } finally {
        this.inProgress.delete(url); // Удаляем запрос из карты
      }
    });

    this.inProgress.set(url, videoPromise); // Сохраняем промис текущей загрузки
    return videoPromise;
  },

  // Очистка устаревших записей из кэша
  async clearOldVideos() {
    await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["videos"], "readwrite");
      const store = transaction.objectStore("videos");

      const request = store.openCursor();
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000; // Записи старше 7 дней

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.timestamp < oneWeekAgo) {
            cursor.delete(); // Удаляем устаревшую запись
          }
          cursor.continue();
        } else {
          console.log("Очистка устаревших данных завершена");
          resolve();
        }
      };

      request.onerror = () => {
        reject("Ошибка очистки устаревших данных");
      };
    });
  },

  // Очистка всей базы данных
  async clearAll() {
    await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["videos"], "readwrite");
      const store = transaction.objectStore("videos");

      const request = store.clear(); // Полная очистка

      request.onsuccess = () => {
        console.log("Кэш успешно очищен");
        resolve();
      };

      request.onerror = () => {
        reject("Ошибка очистки базы данных");
      };
    });
  },
};
